/**
 * POST /api/admin
 *
 * Admin-only traction & registry endpoint (v34.20).
 * Every action requires a valid session token whose email matches the
 * server-side ADMIN_EMAIL env var (re-checked on every call — the client's
 * cached role is never trusted).
 *
 * Actions:
 *   stats      { action, token }          → { counters, users[] }
 *   get_report { action, token, email }   → { report } (that user's latest dashboardResult)
 *
 * users[] rows are a TRIMMED projection (no dossier bodies) so the payload
 * stays small even at ~1000 accounts; full report is fetched per-user on demand.
 */

export const maxDuration = 60;

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const AUTH_USER_PREFIX = 'pc:auth:user:';

const isAdminEmail = (email: string): boolean => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return adminEmail.length > 0 && adminEmail === email;
};

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(503).json({ error: 'Storage not configured', degraded: true });
  }

  const { action } = req.body || {};

  // ── Admin gate ──────────────────────────────────────────────────────────────
  const token = String(req.body?.token || '');
  if (!/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ error: 'Not signed in.' });
  const session: any = await kv.get(`pc:session:${token}`);
  if (!session?.email || session.kind !== 'user') return res.status(401).json({ error: 'Session invalid or expired.' });
  const auth: any = await kv.get(`${AUTH_USER_PREFIX}${session.email}`);
  const currentVersion = typeof auth?.sessionVersion === 'number' ? auth.sessionVersion : 1;
  if (!auth || (session.v ?? 1) !== currentVersion) return res.status(401).json({ error: 'Session invalid or expired.' });
  if (!isAdminEmail(session.email)) return res.status(403).json({ error: 'Admin access required.' });

  try {
    switch (action) {
      // ── Registry + counters ──────────────────────────────────────────────
      case 'stats': {
        const authKeys: string[] = await kv.keys(`${AUTH_USER_PREFIX}*`);
        const emails = authKeys.map((k) => k.slice(AUTH_USER_PREFIX.length)).slice(0, 1000);

        const [providerKeys, historyKeys] = await Promise.all([
          kv.keys('pc:auth:provider:*'),
          kv.keys('pc:history:*'),
        ]);

        const users: any[] = [];
        for (const group of chunk(emails, 100)) {
          const [records, auths] = await Promise.all([
            kv.mget(...group.map((e) => `pc:user:${e}`)),
            kv.mget(...group.map((e) => `${AUTH_USER_PREFIX}${e}`)),
          ]);
          group.forEach((email, i) => {
            const rec: any = records[i];
            const a: any = auths[i];
            const report = rec?.dashboardResult;
            users.push({
              email,
              createdAt: a?.createdAt ?? null,
              migratedFromLegacy: !!a?.migratedFromLegacy,
              hasReport: !!report,
              score: report?.score ?? null,
              level: report?.level ?? null,
              reportGeneratedAt: report?.generatedAt ?? null,
              shareId: report?.shareId ?? null,
              currentStep: typeof rec?.currentStep === 'number' ? rec.currentStep : null,
              plan: rec?.plan ?? null,
            });
          });
        }
        users.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

        const withReport = users.filter((u) => u.hasReport).length;
        const inProgress = users.filter((u) => !u.hasReport && u.currentStep !== null).length;
        return res.status(200).json({
          counters: {
            totalSignups: emails.length,
            reachedReport: withReport,
            inProgress,
            reportsGeneratedTotal: historyKeys.length, // every run ever kept in history
            providerSignups: providerKeys.length,
          },
          users,
        });
      }

      // ── One user's latest report (on demand) ─────────────────────────────
      case 'get_report': {
        const email = String(req.body?.email || '').trim().toLowerCase();
        if (!email) return res.status(400).json({ error: 'Missing email' });
        const rec: any = await kv.get(`pc:user:${email}`);
        if (!rec?.dashboardResult) return res.status(404).json({ error: 'No report for this user.' });
        return res.status(200).json({ report: rec.dashboardResult });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${String(action)}` });
    }
  } catch (err) {
    console.error('Admin operation error:', err);
    return res.status(500).json({ error: 'Admin operation failed', detail: String(err) });
  }
}
