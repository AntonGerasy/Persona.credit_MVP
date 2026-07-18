/**
 * authClient.ts — client wrappers over /api/auth (v34.13 hardening).
 *
 * All password handling happens server-side; this module only ships credentials
 * over HTTPS once and stores the returned opaque session token via session.ts.
 */

import { getSession, setSession, clearSession } from './session';
import type { PcSession } from './session';

export type AuthResult = {
  success: boolean;
  message: string;
  email: string;
  role?: 'user' | 'admin' | 'provider';
  providerId?: string;
};

export type VerifyResult = {
  valid: boolean;
  kind?: 'user' | 'provider';
  email?: string;
  role?: 'user' | 'admin' | 'provider';
  providerId?: string;
};

const AUTH_ENDPOINT = '/api/auth';

async function callAuth(body: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: any }> {
  const response = await fetch(AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

const failure = (message: string): AuthResult => ({ success: false, message, email: '' });

async function credentialAction(
  action: 'signup' | 'login' | 'provider_signup' | 'provider_login',
  kind: 'user' | 'provider',
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const { ok, data } = await callAuth({ action, email, password });
    if (!ok) {
      return failure(String(data?.error || data?.message || 'Authentication failed. Please try again.'));
    }
    const session: PcSession = {
      token: String(data.token),
      kind,
      email: String(data.email),
      role: data.role === 'admin' ? 'admin' : (kind === 'provider' ? 'provider' : 'user'),
      providerId: data.providerId ? String(data.providerId) : undefined,
    };
    setSession(session);
    return { success: true, message: '', email: session.email, role: session.role, providerId: session.providerId };
  } catch (err) {
    console.error(`authClient.${action} error:`, err);
    return failure('Authentication service unreachable. Please check your connection and try again.');
  }
}

export const authClient = {
  signUp: (email: string, password: string) => credentialAction('signup', 'user', email, password),
  logIn: (email: string, password: string) => credentialAction('login', 'user', email, password),
  providerSignUp: (email: string, password: string) => credentialAction('provider_signup', 'provider', email, password),
  providerLogIn: (email: string, password: string) => credentialAction('provider_login', 'provider', email, password),

  async logOut(): Promise<void> {
    const session = getSession();
    clearSession(); // clear locally first — logout must never strand the UI
    if (!session) return;
    try {
      await callAuth({ action: 'logout', token: session.token });
    } catch (err) {
      console.warn('Server-side logout failed (local session cleared):', err);
    }
  },

  async verify(): Promise<VerifyResult> {
    const session = getSession();
    if (!session) return { valid: false };
    try {
      const { ok, data } = await callAuth({ action: 'verify', token: session.token });
      if (!ok || !data?.valid) {
        clearSession();
        return { valid: false };
      }
      // Refresh cached role/providerId — admin env rotation takes effect on reload.
      setSession({ ...session, role: data.role, providerId: data.providerId ?? session.providerId });
      return { valid: true, kind: data.kind, email: data.email, role: data.role, providerId: data.providerId };
    } catch (err) {
      // Network failure ≠ invalid session: keep the token, treat as signed-out for this load.
      console.warn('Session verify unreachable:', err);
      return { valid: false };
    }
  },
};
