/**
 * session.ts — client-side session token store (v34.13 hardening).
 *
 * Holds the opaque random token issued by /api/auth plus display metadata.
 * localStorage is appropriate here (production Vercel app, NOT a chat artifact):
 * the token is a revocable capability with a 30-day server-side TTL, and no
 * secrets (passwords, hashes) are ever kept client-side.
 */

export type PcSession = {
  token: string;
  kind: 'user' | 'provider';
  email: string;
  role: 'user' | 'admin' | 'provider';
  providerId?: string;
};

const SESSION_KEY = 'pc_session_v1';

export const getSession = (): PcSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.token !== 'string' || !parsed.email) return null;
    return parsed as PcSession;
  } catch {
    return null;
  }
};

export const setSession = (s: PcSession): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch { /* storage unavailable — session lives for this page only */ }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
};
