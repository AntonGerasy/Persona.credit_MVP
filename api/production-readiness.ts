import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Public, non-secret production safety probe.
 * It intentionally exposes only boolean readiness signals so deploy checks can
 * verify that QA bypasses are disabled without leaking credentials.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const serverQaEnabled = process.env.PERSONA_QA_FIXTURE_MODE === 'true';
  const storageConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  const aiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const safeForRealUsers = !isProduction || !serverQaEnabled;

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(safeForRealUsers ? 200 : 503).json({
    service: 'persona.credit',
    environment: isProduction ? 'production' : 'non-production',
    qaFixtureMode: serverQaEnabled ? 'ENABLED' : 'disabled',
    storageConfigured,
    aiConfigured,
    safeForRealUsers,
  });
}
