import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * PB1 preflight guard for paid AI endpoints.
 * Requires a live server-side session and applies a simple per-session,
 * per-endpoint fixed-window quota. This is deliberately independent of
 * document content, country, bank, currency, or client-provided identity.
 */
export async function requireAiSession(
  req: VercelRequest,
  res: VercelResponse,
  scope: string,
  limit = 120,
  windowSeconds = 60,
): Promise<boolean> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    res.status(503).json({ error: 'Session service unavailable.' });
    return false;
  }

  const token = req.headers['x-pc-session'];
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    res.status(401).json({ error: 'Authentication required.' });
    return false;
  }

  const session: any = await kv.get(`pc:session:${token}`);
  if (!session?.email || !session?.kind) {
    res.status(401).json({ error: 'Session invalid or expired.' });
    return false;
  }

  const authKey = session.kind === 'provider'
    ? `pc:auth:provider:${session.email}`
    : `pc:auth:user:${session.email}`;
  const auth: any = await kv.get(authKey);
  const currentVersion = typeof auth?.sessionVersion === 'number' ? auth.sessionVersion : 1;
  if (!auth || (session.v ?? 1) !== currentVersion) {
    await kv.del(`pc:session:${token}`);
    res.status(401).json({ error: 'Session invalid or expired.' });
    return false;
  }

  const safeScope = String(scope || 'ai').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || 'ai';
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const rateKey = `pc:rate:${safeScope}:${session.email}:${bucket}`;
  const count = await kv.incr(rateKey);
  if (count === 1) await kv.expire(rateKey, windowSeconds + 5);
  if (count > limit) {
    res.setHeader('Retry-After', String(windowSeconds));
    res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    return false;
  }

  return true;
}
