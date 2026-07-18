/**
 * POST /api/kv
 *
 * Server-side proxy for Vercel KV (Redis) storage.
 * Replaces localStorage + btoa "encryption" with real server-side storage.
 *
 * Operations:
 *   GET    { op: 'get', key: string }
 *   SET    { op: 'set', key: string, value: any, ttl?: number }
 *   DELETE { op: 'delete', key: string }
 *   KEYS   { op: 'keys', prefix: string }
 *
 * v34.13 hardening — key access is now AUTHORIZED, not caller's-responsibility:
 *   - Every request (except public share reads, below) must carry a valid
 *     session token in the 'x-pc-session' header (issued by /api/auth).
 *   - A 'user' session may touch ONLY pc:user:{ownEmail}, pc:history:{ownEmail}:*,
 *     and the shared marketplace blob pc:shared.
 *   - A 'provider' session may touch ONLY pc:provideruser:{ownEmail},
 *     pc:provider:{ownProviderId}, and pc:shared.
 *   - pc:auth:*, pc:session:*, and the legacy pc:fulldb blob are server-only and
 *     always refused here regardless of session.
 *   - pc:share:{token} is a capability URL record: GET is public (the token IS
 *     the secret); writes require any authenticated session.
 *
 * TTL is in seconds. Default TTL for user data: 90 days.
 */

export const maxDuration = 60; // Vercel Hobby supports up to 60s via module-level export


import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const DEFAULT_TTL = 60 * 60 * 24 * 90; // 90 days in seconds

// Key validation — prevent path traversal or injection
const isValidKey = (key: string): boolean => {
  return typeof key === 'string' &&
    key.length > 0 &&
    key.length < 512 &&
    /^[a-zA-Z0-9:_\-\.@]+$/.test(key);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check KV is configured
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    // KV not configured — return a graceful degraded response
    // The client will fall back to localStorage in this case
    return res.status(503).json({
      error: 'Storage not configured',
      degraded: true,
      message: 'Vercel KV not connected. Enable KV storage in your Vercel project to persist data across sessions.',
    });
  }

  const { op, key, value, ttl, prefix } = req.body;

  // ── v34.13 session enforcement ─────────────────────────────────────────────
  // Server-only namespaces: never reachable through this proxy, session or not.
  const SERVER_ONLY_PREFIXES = ['pc:auth:', 'pc:session:'];
  const isServerOnly = (k: string): boolean =>
    k === 'pc:fulldb' || SERVER_ONLY_PREFIXES.some((p) => k.startsWith(p));

  // Public capability read: report share links work without a login — the
  // unguessable token in the URL is the access credential.
  const isPublicShareGet = op === 'get' && typeof key === 'string' && key.startsWith('pc:share:');

  let session: { kind: string; email: string; providerId?: string } | null = null;
  if (!isPublicShareGet) {
    const token = req.headers['x-pc-session'];
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const sessionData = await kv.get(`pc:session:${token}`);
    if (!sessionData || typeof sessionData !== 'object' || !(sessionData as any).email) {
      return res.status(401).json({ error: 'Session invalid or expired' });
    }
    session = sessionData as { kind: string; email: string; providerId?: string };
  }

  const canAccessKey = (k: string): boolean => {
    if (isServerOnly(k)) return false;
    if (k.startsWith('pc:share:')) return true; // GET is public; writes reach here only WITH a session
    if (!session) return false;
    if (session.kind === 'user') {
      return k === `pc:user:${session.email}` ||
        k.startsWith(`pc:history:${session.email}:`) ||
        k === 'pc:shared';
    }
    if (session.kind === 'provider') {
      return k === `pc:provideruser:${session.email}` ||
        (!!session.providerId && k === `pc:provider:${session.providerId}`) ||
        k === 'pc:shared';
    }
    return false;
  };

  const canScanPrefix = (p: string): boolean => {
    if (!session) return false;
    if (session.kind === 'user') return p === `pc:history:${session.email}:` || p === `pc:user:${session.email}`;
    return false;
  };
  // ───────────────────────────────────────────────────────────────────────────

  try {
    switch (op) {
      case 'get': {
        if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' });
        if (!canAccessKey(key)) return res.status(403).json({ error: 'Access denied for this key' });
        const data = await kv.get(key);
        return res.status(200).json({ value: data });
      }

      case 'set': {
        if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' });
        if (!canAccessKey(key)) return res.status(403).json({ error: 'Access denied for this key' });
        if (value === undefined) return res.status(400).json({ error: 'Missing value' });

        const effectiveTtl = typeof ttl === 'number' ? ttl : DEFAULT_TTL;
        await kv.set(key, value, { ex: effectiveTtl });
        return res.status(200).json({ ok: true });
      }

      case 'delete': {
        if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' });
        if (!canAccessKey(key)) return res.status(403).json({ error: 'Access denied for this key' });
        await kv.del(key);
        return res.status(200).json({ ok: true });
      }

      case 'keys': {
        if (!prefix || typeof prefix !== 'string') {
          return res.status(400).json({ error: 'Missing prefix for keys operation' });
        }
        if (!canScanPrefix(prefix)) return res.status(403).json({ error: 'Access denied for this prefix' });
        // Scan with prefix — returns array of matching keys
        const keys = await kv.keys(`${prefix}*`);
        return res.status(200).json({ keys });
      }

      default:
        return res.status(400).json({ error: `Unknown operation: ${op}` });
    }
  } catch (err) {
    console.error('KV operation error:', err);
    return res.status(500).json({ error: 'Storage operation failed', detail: String(err) });
  }
}
