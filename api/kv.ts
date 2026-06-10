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
 * All keys are namespaced per user via the key itself (caller's responsibility).
 * TTL is in seconds. Default TTL for user data: 90 days.
 */
export const maxDuration = 60; // Vercel Hobby supports up to 60s via module export


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

  try {
    switch (op) {
      case 'get': {
        if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' });
        const data = await kv.get(key);
        return res.status(200).json({ value: data });
      }

      case 'set': {
        if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' });
        if (value === undefined) return res.status(400).json({ error: 'Missing value' });

        const effectiveTtl = typeof ttl === 'number' ? ttl : DEFAULT_TTL;
        await kv.set(key, value, { ex: effectiveTtl });
        return res.status(200).json({ ok: true });
      }

      case 'delete': {
        if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' });
        await kv.del(key);
        return res.status(200).json({ ok: true });
      }

      case 'keys': {
        if (!prefix || typeof prefix !== 'string') {
          return res.status(400).json({ error: 'Missing prefix for keys operation' });
        }
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
