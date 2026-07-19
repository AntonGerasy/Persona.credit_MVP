/**
 * POST /api/auth
 *
 * Server-side authentication (v34.13 hardening — step 2/4).
 * Replaces the client-side bcrypt flow and removes the hardcoded admin backdoor:
 * passwords are now hashed and verified ONLY on the server, and the client holds
 * nothing but an opaque random session token.
 *
 * Actions (all POST, JSON body):
 *   signup          { action, email, password } → { token, email, role }
 *   login           { action, email, password } → { token, email, role }
 *   provider_signup { action, email, password } → { token, email, role:'provider', providerId }
 *   provider_login  { action, email, password } → { token, email, role:'provider', providerId }
 *   logout          { action, token }           → { ok: true }
 *   verify          { action, token }           → { valid, kind, email, role, providerId? }
 *   change_password { action, token, currentPassword, newPassword }
 *                                               → { token (NEW), email, role, providerId? }
 *   delete_account  { action, token, password } → { ok: true }  (permanent; removes
 *                     auth record, app data, history, share link, permissions; all
 *                     sessions die because the auth record they validate against is gone)
 *
 * v34.14 session revocation: every auth record carries a sessionVersion; each
 * issued session token embeds the version it was minted with. change_password
 * bumps the version, which instantly invalidates ALL previously issued tokens
 * for that account (checked in verify here AND on every /api/kv call) — critical
 * because the pre-v34.13 admin password was exposed in the public JS bundle.
 *
 * KV keys (server-only — the /api/kv proxy refuses these prefixes):
 *   pc:auth:user:{email}      { passwordHash, role, createdAt }        (no TTL)
 *   pc:auth:provider:{email}  { passwordHash, providerId, createdAt }  (no TTL)
 *   pc:session:{token}        { kind, email, role, providerId? }       (TTL 30 days)
 *
 * Admin role: granted iff the account email equals process.env.ADMIN_EMAIL
 * (server-side env var; NEVER use a VITE_ prefix — that would inline it into
 * the public client bundle). Evaluated on every login/verify, so setting or
 * rotating the env var takes effect immediately without re-signup.
 *
 * Legacy migration: v34.12 and earlier kept a single 'pc:fulldb' blob with
 * client-side bcrypt hashes. On first login of a legacy account, the hash is
 * verified against the legacy record and the account is migrated in place to
 * pc:auth:* / pc:user:{email} (passwords never leave the server). The shared
 * marketplace slice (offers/tickets) is seeded from the legacy blob once.
 */

export const maxDuration = 60; // Vercel Hobby supports up to 60s via module-level export

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

const SESSION_TTL = 60 * 60 * 24 * 30;   // 30 days
const USER_DATA_TTL = 60 * 60 * 24 * 90; // 90 days — matches /api/kv DEFAULT_TTL

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normEmail = (e: unknown): string => String(e || '').trim().toLowerCase();

const isAdminEmail = (email: string): boolean => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return adminEmail.length > 0 && adminEmail === email;
};

const newToken = (): string => randomBytes(32).toString('hex');

type SessionPayload = {
  kind: 'user' | 'provider';
  email: string;
  role: 'user' | 'admin' | 'provider';
  providerId?: string;
  v?: number; // sessionVersion the token was minted with (v34.14); absent = 1
};

const createSession = async (payload: SessionPayload): Promise<string> => {
  const token = newToken();
  await kv.set(`pc:session:${token}`, payload, { ex: SESSION_TTL });
  return token;
};

// Auth-record session version, defaulting to 1 for records created before v34.14.
const versionOf = (auth: any): number => (typeof auth?.sessionVersion === 'number' ? auth.sessionVersion : 1);

// ── Legacy pc:fulldb migration helpers ──────────────────────────────────────

const getLegacyDB = async (): Promise<any | null> => {
  try {
    const legacy = await kv.get('pc:fulldb');
    return legacy && typeof legacy === 'object' ? legacy : null;
  } catch {
    return null;
  }
};

// Case-tolerant lookup in a legacy record map keyed by raw (possibly mixed-case) emails.
const legacyLookup = (map: any, email: string): any | null => {
  if (!map || typeof map !== 'object') return null;
  if (map[email]) return map[email];
  const hit = Object.keys(map).find((k) => k.toLowerCase() === email);
  return hit ? map[hit] : null;
};

// Seed the shared marketplace blob from the legacy DB exactly once.
const seedSharedFromLegacy = async (legacy: any): Promise<void> => {
  try {
    const existing = await kv.get('pc:shared');
    if (existing) return;
    const providersPublic: Record<string, any> = {};
    const providers = legacy?.providers && typeof legacy.providers === 'object' ? legacy.providers : {};
    for (const pid of Object.keys(providers)) {
      providersPublic[pid] = { id: pid, kybData: { companyName: providers[pid]?.kybData?.companyName ?? null } };
    }
    await kv.set('pc:shared', {
      offers: legacy?.offers && typeof legacy.offers === 'object' ? legacy.offers : {},
      permissions: Array.isArray(legacy?.permissions) ? legacy.permissions : [],
      support_tickets: legacy?.support_tickets && typeof legacy.support_tickets === 'object' ? legacy.support_tickets : {},
      providersPublic,
    });
  } catch (err) {
    console.warn('Legacy shared seed failed (non-fatal):', err);
  }
};

// ── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(503).json({
      error: 'Storage not configured',
      degraded: true,
      message: 'Vercel KV is not connected — authentication requires server-side storage.',
    });
  }

  const { action } = req.body || {};

  try {
    switch (action) {
      // ── Applicant signup ──────────────────────────────────────────────────
      case 'signup': {
        const email = normEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

        const existing = await kv.get(`pc:auth:user:${email}`);
        if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });
        // Also refuse if a legacy (unmigrated) account exists under this email.
        const legacy = await getLegacyDB();
        if (legacy && legacyLookup(legacy.users, email)?.password) {
          return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
        }

        const role: SessionPayload['role'] = isAdminEmail(email) ? 'admin' : 'user';
        await kv.set(`pc:auth:user:${email}`, {
          passwordHash: bcrypt.hashSync(password, 10),
          role,
          sessionVersion: 1,
          createdAt: Date.now(),
        });
        const token = await createSession({ kind: 'user', email, role, v: 1 });
        return res.status(200).json({ token, email, role });
      }

      // ── Applicant login (with legacy migration) ───────────────────────────
      case 'login': {
        const email = normEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!EMAIL_RE.test(email) || !password) return res.status(401).json({ error: 'Invalid email or password.' });

        let auth: any = await kv.get(`pc:auth:user:${email}`);

        if (!auth) {
          // Legacy path: account may still live in the v34.12 pc:fulldb blob.
          const legacy = await getLegacyDB();
          const legacyUser = legacy ? legacyLookup(legacy.users, email) : null;
          if (!legacyUser?.password || !bcrypt.compareSync(password, legacyUser.password)) {
            return res.status(401).json({ error: 'Invalid email or password.' });
          }
          // Migrate: auth record (server-only) + app data (client-scoped key).
          auth = { passwordHash: legacyUser.password, role: 'user', sessionVersion: 1, createdAt: Date.now(), migratedFromLegacy: true };
          await kv.set(`pc:auth:user:${email}`, auth);
          const alreadyMigrated = await kv.get(`pc:user:${email}`);
          if (!alreadyMigrated) {
            const { password: _pw, ...appData } = legacyUser;
            await kv.set(`pc:user:${email}`, appData, { ex: USER_DATA_TTL });
          }
          await seedSharedFromLegacy(legacy);
        } else if (!bcrypt.compareSync(password, String(auth.passwordHash || ''))) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const role: SessionPayload['role'] = isAdminEmail(email) ? 'admin' : (auth.role === 'admin' ? 'admin' : 'user');
        const token = await createSession({ kind: 'user', email, role, v: versionOf(auth) });
        return res.status(200).json({ token, email, role });
      }

      // ── Provider signup ───────────────────────────────────────────────────
      case 'provider_signup': {
        const email = normEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

        const existing = await kv.get(`pc:auth:provider:${email}`);
        if (existing) return res.status(409).json({ error: 'A provider account with this email already exists.' });
        const legacy = await getLegacyDB();
        if (legacy && legacyLookup(legacy.providerUsers, email)?.password) {
          return res.status(409).json({ error: 'A provider account with this email already exists. Please log in.' });
        }

        const providerId = `prov_${Date.now()}_${randomBytes(4).toString('hex')}`;
        await kv.set(`pc:auth:provider:${email}`, {
          passwordHash: bcrypt.hashSync(password, 10),
          providerId,
          sessionVersion: 1,
          createdAt: Date.now(),
        });
        const token = await createSession({ kind: 'provider', email, role: 'provider', providerId, v: 1 });
        return res.status(200).json({ token, email, role: 'provider', providerId });
      }

      // ── Provider login (with legacy migration) ────────────────────────────
      case 'provider_login': {
        const email = normEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!EMAIL_RE.test(email) || !password) return res.status(401).json({ error: 'Invalid provider email or password.' });

        let auth: any = await kv.get(`pc:auth:provider:${email}`);

        if (!auth) {
          const legacy = await getLegacyDB();
          const legacyPU = legacy ? legacyLookup(legacy.providerUsers, email) : null;
          if (!legacyPU?.password || !bcrypt.compareSync(password, legacyPU.password)) {
            return res.status(401).json({ error: 'Invalid provider email or password.' });
          }
          const providerId = String(legacyPU.providerId || `prov_${Date.now()}_${randomBytes(4).toString('hex')}`);
          auth = { passwordHash: legacyPU.password, providerId, sessionVersion: 1, createdAt: Date.now(), migratedFromLegacy: true };
          await kv.set(`pc:auth:provider:${email}`, auth);
          const alreadyPU = await kv.get(`pc:provideruser:${email}`);
          if (!alreadyPU) {
            await kv.set(`pc:provideruser:${email}`, { email, providerId }, { ex: USER_DATA_TTL });
          }
          const legacyProv = legacy?.providers?.[providerId];
          const alreadyProv = await kv.get(`pc:provider:${providerId}`);
          if (legacyProv && !alreadyProv) {
            await kv.set(`pc:provider:${providerId}`, legacyProv, { ex: USER_DATA_TTL });
          }
          await seedSharedFromLegacy(legacy);
        } else if (!bcrypt.compareSync(password, String(auth.passwordHash || ''))) {
          return res.status(401).json({ error: 'Invalid provider email or password.' });
        }

        const providerId = String(auth.providerId || '');
        const token = await createSession({ kind: 'provider', email, role: 'provider', providerId, v: versionOf(auth) });
        return res.status(200).json({ token, email, role: 'provider', providerId });
      }

      // ── Logout ────────────────────────────────────────────────────────────
      case 'logout': {
        const token = String(req.body.token || '');
        if (/^[a-f0-9]{64}$/.test(token)) {
          await kv.del(`pc:session:${token}`);
        }
        return res.status(200).json({ ok: true });
      }

      // ── Verify ────────────────────────────────────────────────────────────
      case 'verify': {
        const token = String(req.body.token || '');
        if (!/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ valid: false });
        const session = (await kv.get(`pc:session:${token}`)) as SessionPayload | null;
        if (!session || !session.email) return res.status(401).json({ valid: false });
        // v34.14: a password change bumps sessionVersion — tokens minted before
        // the change no longer match and are refused here (and in /api/kv).
        const authKey = session.kind === 'provider' ? `pc:auth:provider:${session.email}` : `pc:auth:user:${session.email}`;
        const auth = await kv.get(authKey);
        if (!auth || (session.v ?? 1) !== versionOf(auth)) {
          await kv.del(`pc:session:${token}`);
          return res.status(401).json({ valid: false });
        }
        // Re-evaluate admin role from env on every verify (rotation-friendly).
        const role = session.kind === 'user'
          ? (isAdminEmail(session.email) ? 'admin' : 'user')
          : 'provider';
        return res.status(200).json({
          valid: true,
          kind: session.kind,
          email: session.email,
          role,
          providerId: session.providerId,
        });
      }

      // ── Change password (revokes ALL other sessions) ──────────────────────
      case 'change_password': {
        const token = String(req.body.token || '');
        const currentPassword = String(req.body.currentPassword || '');
        const newPassword = String(req.body.newPassword || '');
        if (!/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ error: 'Not signed in.' });
        if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

        const session = (await kv.get(`pc:session:${token}`)) as SessionPayload | null;
        if (!session || !session.email) return res.status(401).json({ error: 'Session invalid or expired.' });

        const authKey = session.kind === 'provider' ? `pc:auth:provider:${session.email}` : `pc:auth:user:${session.email}`;
        const auth: any = await kv.get(authKey);
        if (!auth || (session.v ?? 1) !== versionOf(auth)) {
          await kv.del(`pc:session:${token}`);
          return res.status(401).json({ error: 'Session invalid or expired.' });
        }
        if (!bcrypt.compareSync(currentPassword, String(auth.passwordHash || ''))) {
          return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        const newVersion = versionOf(auth) + 1;
        await kv.set(authKey, {
          ...auth,
          passwordHash: bcrypt.hashSync(newPassword, 10),
          sessionVersion: newVersion,
          pwdChangedAt: Date.now(),
        });
        await kv.del(`pc:session:${token}`); // old token gone; every other token is dead via version bump
        const role: SessionPayload['role'] = session.kind === 'provider'
          ? 'provider'
          : (isAdminEmail(session.email) ? 'admin' : (auth.role === 'admin' ? 'admin' : 'user'));
        const freshToken = await createSession({
          kind: session.kind,
          email: session.email,
          role,
          providerId: session.providerId,
          v: newVersion,
        });
        return res.status(200).json({ token: freshToken, email: session.email, role, providerId: session.providerId });
      }

      // ── Delete account (permanent; password-confirmed) ────────────────────
      case 'delete_account': {
        const token = String(req.body.token || '');
        const password = String(req.body.password || '');
        if (!/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ error: 'Not signed in.' });

        const session = (await kv.get(`pc:session:${token}`)) as SessionPayload | null;
        if (!session || !session.email) return res.status(401).json({ error: 'Session invalid or expired.' });

        const isProvider = session.kind === 'provider';
        const authKey = isProvider ? `pc:auth:provider:${session.email}` : `pc:auth:user:${session.email}`;
        const auth: any = await kv.get(authKey);
        if (!auth || (session.v ?? 1) !== versionOf(auth)) {
          await kv.del(`pc:session:${token}`);
          return res.status(401).json({ error: 'Session invalid or expired.' });
        }
        if (!bcrypt.compareSync(password, String(auth.passwordHash || ''))) {
          return res.status(401).json({ error: 'Password is incorrect.' });
        }

        try {
          if (isProvider) {
            const pid = String(auth.providerId || session.providerId || '');
            await kv.del(`pc:provideruser:${session.email}`);
            if (pid) await kv.del(`pc:provider:${pid}`);
            // Remove the provider's offers and public directory entry from the shared blob
            const shared: any = await kv.get('pc:shared');
            if (shared && typeof shared === 'object') {
              const offers = shared.offers && typeof shared.offers === 'object' ? shared.offers : {};
              for (const oid of Object.keys(offers)) {
                if (offers[oid]?.providerId === pid) delete offers[oid];
              }
              if (shared.providersPublic && typeof shared.providersPublic === 'object') delete shared.providersPublic[pid];
              await kv.set('pc:shared', shared);
            }
          } else {
            // Capture the share link before deleting the user record, then remove both
            const userRecord: any = await kv.get(`pc:user:${session.email}`);
            const shareId = userRecord?.dashboardResult?.shareId;
            await kv.del(`pc:user:${session.email}`);
            if (shareId) await kv.del(`pc:share:${shareId}`);
            // Assessment history
            const historyKeys = await kv.keys(`pc:history:${session.email}:*`);
            for (const hk of historyKeys) await kv.del(hk);
            // Permissions/tickets referencing this user in the shared blob
            const shared: any = await kv.get('pc:shared');
            if (shared && typeof shared === 'object') {
              if (Array.isArray(shared.permissions)) {
                shared.permissions = shared.permissions.filter((perm: any) => perm?.userId !== session.email);
              }
              if (shared.support_tickets && typeof shared.support_tickets === 'object') {
                for (const tid of Object.keys(shared.support_tickets)) {
                  if (shared.support_tickets[tid]?.userId === session.email) delete shared.support_tickets[tid];
                }
              }
              await kv.set('pc:shared', shared);
            }
          }
        } catch (cleanupErr) {
          console.warn('Account cleanup partial failure (auth record will still be removed):', cleanupErr);
        }

        await kv.del(authKey);            // kills the login itself
        await kv.del(`pc:session:${token}`); // other tokens die on their next check (auth record gone)
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${String(action)}` });
    }
  } catch (err) {
    console.error('Auth operation error:', err);
    return res.status(500).json({ error: 'Authentication failed', detail: String(err) });
  }
}
