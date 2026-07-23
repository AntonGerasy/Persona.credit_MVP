/**
 * storage.ts — Persona.Credit data layer
 *
 * Primary:  Vercel KV via /api/kv (server-side Redis, 90-day TTL)
 * Fallback: localStorage (used if KV not configured or offline)
 *
 * v34.13 hardening: the single shared 'pc:fulldb' blob is GONE. The db facade
 * below keeps the old AppDB shape (so App.tsx call sites keep working), but it
 * is now assembled from session-scoped keys — a session can only ever load and
 * save ITS OWN slice; isolation is enforced server-side in /api/kv. Passwords
 * never reach this layer anymore (auth lives in /api/auth).
 *
 * Key schema:
 *   pc:user:{email}          → user app record (formData, dashboardResult, plan)
 *   pc:history:{email}:{ts}  → historical analysis entry (step 2/4-B)
 *   pc:provideruser:{email}  → provider login record (email, providerId)
 *   pc:provider:{pid}        → provider record (formData, kybData)
 *   pc:shared                → marketplace blob (offers, permissions,
 *                              support_tickets, providersPublic)
 *   pc:share:{token}         → public report capability record
 *   pc:auth:* / pc:session:* → server-only (refused by /api/kv)
 */

import { getSession, clearSession } from './session';

const LS_KEY = 'persona_credit_db_v1';
const KV_ENDPOINT = '/api/kv';

// ─── KV client ────────────────────────────────────────────────────────────────

type KVOp = 'get' | 'set' | 'delete' | 'keys';

async function kvCall(op: KVOp, params: Record<string, any>): Promise<any> {
  const session = getSession();
  const response = await fetch(KV_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { 'x-pc-session': session.token } : {}),
    },
    body: JSON.stringify({ op, ...params }),
  });

  // v34.21: a 401 with a token attached means THIS tab's session was revoked
  // (password changed / account deleted elsewhere). A stale tab must not keep
  // pretending to be signed in — clear the dead token and reload to landing.
  if (response.status === 401 && session) {
    clearSession();
    try { localStorage.removeItem('pc_cache_v2'); } catch { /* ignore */ }
    window.location.reload();
    throw new Error('Session revoked — reloading');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (body.degraded) {
      // KV not configured — caller will handle fallback
      throw new KVNotConfiguredError(body.message);
    }
    throw new Error(`KV ${op} failed: ${response.status} ${body.error || ''}`);
  }

  return response.json();
}

class KVNotConfiguredError extends Error {
  constructor(msg?: string) {
    super(msg || 'KV not configured');
    this.name = 'KVNotConfiguredError';
  }
}

// ─── LocalStorage fallback ────────────────────────────────────────────────────

function lsLoad(): Record<string, any> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function lsSave(store: Record<string, any>): void {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

// ─── Public storage API ───────────────────────────────────────────────────────

export const storage = {

  async get(key: string): Promise<any | null> {
    try {
      const result = await kvCall('get', { key });
      return result.value ?? null;
    } catch (err) {
      if (err instanceof KVNotConfiguredError) {
        const store = lsLoad();
        return store[key] ?? null;
      }
      console.error('storage.get error:', err);
      return lsLoad()[key] ?? null;
    }
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await kvCall('set', { key, value, ttl });
    } catch (err) {
      if (err instanceof KVNotConfiguredError) {
        const store = lsLoad();
        store[key] = value;
        lsSave(store);
        return;
      }
      console.error('storage.set error, falling back to localStorage:', err);
      const store = lsLoad();
      store[key] = value;
      lsSave(store);
    }
  },

  // v34.24 (P1): strict write for CRITICAL publications (e.g. a shareable report
  // link). Unlike set(), it does NOT silently fall back to localStorage — it
  // THROWS if the server write fails, so the UI can show a retry instead of
  // claiming success on a link the recipient could never open. Only use this
  // where a false success would mislead someone; keep set() for drafts/autosave.
  async setStrict(key: string, value: any, ttl?: number): Promise<void> {
    await kvCall('set', { key, value, ttl });
  },

  // v34.25-safe: strict delete for security-sensitive operations such as
  // revoking a public report link. Never falls back and never swallows errors.
  async deleteStrict(key: string): Promise<void> {
    await kvCall('delete', { key });
  },

  async delete(key: string): Promise<void> {
    try {
      await kvCall('delete', { key });
    } catch (err) {
      if (err instanceof KVNotConfiguredError) {
        const store = lsLoad();
        delete store[key];
        lsSave(store);
        return;
      }
      console.error('storage.delete error:', err);
    }
  },

  async keys(prefix: string): Promise<string[]> {
    try {
      const result = await kvCall('keys', { prefix });
      return result.keys ?? [];
    } catch (err) {
      if (err instanceof KVNotConfiguredError) {
        const store = lsLoad();
        return Object.keys(store).filter(k => k.startsWith(prefix));
      }
      console.error('storage.keys error:', err);
      return [];
    }
  },
};

// ─── High-level DB API (v34.13: assembled from session-scoped keys) ──────────
// The AppDB SHAPE is preserved so existing App.tsx call sites keep working, but
// the content is now strictly session-scoped: a user session sees only its own
// user record; a provider session sees only its own provider records. The
// marketplace slice (offers / permissions / support_tickets) plus a public
// provider directory live in a shared blob. Applicant sessions do not load or
// write that blob; it is retained only for future provider compatibility.

export type AppDB = {
  users: Record<string, any>;
  currentUser: string | null;
  providers: Record<string, any>;
  providerUsers: Record<string, any>;
  currentProvider: string | null;
  offers: Record<string, any>;
  permissions: any[];
  support_tickets: Record<string, any>;
};

type SharedBlob = {
  offers: Record<string, any>;
  permissions: any[];
  support_tickets: Record<string, any>;
  // Public projection of providers for offer matching: { [pid]: { id, kybData: { companyName } } }
  providersPublic: Record<string, any>;
};

const CACHE_KEY = 'pc_cache_v2'; // per-device cache of the assembled, session-scoped AppDB
const SHARED_KEY = 'pc:shared';

const emptyShared = (): SharedBlob => ({ offers: {}, permissions: [], support_tickets: {}, providersPublic: {} });

const emptyDB = (): AppDB => ({
  users: {},
  currentUser: null,
  providers: {},
  providerUsers: {},
  currentProvider: null,
  offers: {},
  permissions: [],
  support_tickets: {},
});

// Snapshot of the shared blob as last loaded. Used to (a) carry providersPublic
// through saves and (b) skip the shared write when nothing in it changed —
// otherwise a stale cached copy could clobber another session's marketplace
// writes (last-write-wins on the blob is a documented MVP limitation).
let loadedShared: SharedBlob = emptyShared();
let loadedSharedJson: string = JSON.stringify(loadedShared);

const cacheWrite = (data: AppDB): void => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
};

const cacheRead = (): AppDB | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AppDB) : null;
  } catch {
    return null;
  }
};

// Project the shared slice out of an AppDB for persistence. For a provider
// session, refresh that provider's PUBLIC entry (companyName only — full KYB
// data stays in the provider's own key).
const sharedFromDB = (data: AppDB): SharedBlob => {
  const s = getSession();
  const providersPublic: Record<string, any> = { ...loadedShared.providersPublic };
  if (s?.kind === 'provider' && s.providerId && data.providers[s.providerId]) {
    const kyb = data.providers[s.providerId].kybData;
    providersPublic[s.providerId] = { id: s.providerId, kybData: { companyName: kyb?.companyName ?? null } };
  }
  return {
    offers: data.offers || {},
    permissions: data.permissions || [],
    support_tickets: data.support_tickets || {},
    providersPublic,
  };
};

// Persist ONLY the keys this session owns (plus shared, if it changed).
async function persistScoped(data: AppDB): Promise<void> {
  const s = getSession();
  if (!s) return; // no session — nothing may be persisted server-side

  const writes: Promise<void>[] = [];
  if (s.kind === 'user') {
    const me = data.users[s.email];
    if (me !== undefined) writes.push(storage.set(`pc:user:${s.email}`, me));
  } else if (s.kind === 'provider' && s.providerId) {
    const pu = data.providerUsers[s.email];
    if (pu !== undefined) writes.push(storage.set(`pc:provideruser:${s.email}`, pu));
    const prov = data.providers[s.providerId];
    if (prov !== undefined) writes.push(storage.set(`pc:provider:${s.providerId}`, prov));
  }

  // v34.25-safe: only provider sessions may persist marketplace/shared data.
  // Applicant actions must never expose or overwrite support tickets or provider data.
  if (s.kind === 'provider') {
    const shared = sharedFromDB(data);
    const sharedJson = JSON.stringify(shared);
    if (sharedJson !== loadedSharedJson) {
      writes.push(storage.set(SHARED_KEY, shared));
      loadedShared = shared;
      loadedSharedJson = sharedJson;
    }
  }

  await Promise.all(writes);
}

export const db = {
  /**
   * Synchronous read from the per-device cache of the last assembled scoped DB.
   * Kept for legacy call sites (render bodies, sync handlers).
   */
  load(): AppDB {
    return cacheRead() ?? emptyDB();
  },

  async loadAsync(): Promise<AppDB> {
    const s = getSession();
    const out = emptyDB();
    if (!s) {
      cacheWrite(out);
      return out;
    }
    try {
      // Race each KV read against a 5s timeout — never let a hanging KV block startup.
      const withTimeout = <T>(p: Promise<T>): Promise<T | null> =>
        Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))]);

      const [own, ownProviderPair, sharedRaw] = await Promise.all([
        s.kind === 'user' ? withTimeout(storage.get(`pc:user:${s.email}`)) : Promise.resolve(null),
        s.kind === 'provider' && s.providerId
          ? withTimeout(Promise.all([storage.get(`pc:provideruser:${s.email}`), storage.get(`pc:provider:${s.providerId}`)]))
          : Promise.resolve(null),
        // v34.25-safe: applicants must not request pc:shared at all.
        s.kind === 'provider' ? withTimeout(storage.get(SHARED_KEY)) : Promise.resolve(null),
      ]);

      const shared: SharedBlob = s.kind === 'provider' && sharedRaw && typeof sharedRaw === 'object'
        ? { ...emptyShared(), ...(sharedRaw as Partial<SharedBlob>) }
        : emptyShared();
      loadedShared = shared;
      loadedSharedJson = JSON.stringify(shared);

      if (s.kind === 'provider') {
        out.offers = shared.offers;
        out.permissions = shared.permissions;
        out.support_tickets = shared.support_tickets;
      }

      if (s.kind === 'user') {
        out.currentUser = s.email;
        out.users[s.email] = own && typeof own === 'object' ? own : {};
        // Provider marketplace is intentionally unavailable in the applicant MVP.
        out.providers = {};
      } else if (s.kind === 'provider' && s.providerId) {
        out.currentProvider = s.email;
        const pu = Array.isArray(ownProviderPair) ? ownProviderPair[0] : null;
        const prov = Array.isArray(ownProviderPair) ? ownProviderPair[1] : null;
        out.providerUsers[s.email] = pu && typeof pu === 'object' ? pu : { email: s.email, providerId: s.providerId };
        out.providers[s.providerId] = prov && typeof prov === 'object' ? prov : { id: s.providerId, formData: null, kybData: null };
      }
    } catch (err) {
      console.error('db.loadAsync error (serving empty scoped DB):', err);
    }
    cacheWrite(out);
    return out;
  },

  save(data: AppDB): void {
    // Sync write to the device cache immediately; KV writes go in the background.
    cacheWrite(data);
    persistScoped(data).catch((err) => {
      console.warn('KV background save failed (device cache retained):', err);
    });
  },

  async saveAsync(data: AppDB): Promise<void> {
    cacheWrite(data);
    // NEVER throw on KV failure — the device cache already has the data.
    try {
      await persistScoped(data);
    } catch (err) {
      console.warn('KV save failed (device cache retained):', err);
    }
  },
};
