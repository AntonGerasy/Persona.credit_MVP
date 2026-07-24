/**
 * session.ts — client-side session token store (v34.13 hardening).
 *
 * Holds the opaque random token issued by /api/auth plus display metadata.
 * sessionStorage is used for the applicant/provider session so a newly opened browser
 * window does not silently inherit the active financial profile. The opaque token remains
 * revocable server-side; passwords and hashes are never stored client-side.
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
    const raw = sessionStorage.getItem(SESSION_KEY);
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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch { /* storage unavailable — session lives for this page only */ }
};

export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
};
