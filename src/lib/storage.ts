/**
 * storage.ts — Persona.Credit data layer
 *
 * Primary:  Vercel KV via /api/kv (server-side Redis, 90-day TTL)
 * Fallback: localStorage (used if KV not configured or offline)
 *
 * Data is stored as plain JSON — no more btoa() pseudo-encryption.
 * Sensitive fields (passwords) are hashed with bcrypt before storage,
 * which this layer does not handle — that's the auth layer's job.
 *
 * Key schema:
 *   pc:user:{uid}            → user record (auth + profile)
 *   pc:dashboard:{uid}       → latest dashboard result
 *   pc:history:{uid}:{ts}    → historical analysis entry
 *   pc:session:{uid}         → active session token
 *   pc:provider:{pid}        → provider record
 *   pc:permission:{uid}:{oid}→ share permission
 */

const LS_KEY = 'persona_credit_db_v1';
const KV_ENDPOINT = '/api/kv';

// ─── KV client ────────────────────────────────────────────────────────────────

type KVOp = 'get' | 'set' | 'delete' | 'keys';

async function kvCall(op: KVOp, params: Record<string, any>): Promise<any> {
  const response = await fetch(KV_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, ...params }),
  });

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

// ─── High-level DB API (mirrors old db interface) ─────────────────────────────
// This preserves compatibility with existing App.tsx call sites.

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

const FULL_DB_KEY = 'pc:fulldb';

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

export const db = {
  /**
   * Load the full DB object.
   * Async version preferred; sync version available for legacy call sites.
   */
  load(): AppDB {
    // Synchronous fallback for legacy call sites — reads from localStorage only
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        const full = store[FULL_DB_KEY];
        if (full) return full;
      }
    } catch { /* ignore */ }
    return emptyDB();
  },

  async loadAsync(): Promise<AppDB> {
    try {
      // Race KV against a 5s timeout — never let a hanging KV block startup.
      const data = await Promise.race([
        storage.get(FULL_DB_KEY),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      if (data && typeof data === 'object') return data as AppDB;
    } catch { /* ignore — fall through to localStorage */ }
    // Try legacy localStorage format
    const legacy = db.load();
    if (Object.keys(legacy.users).length > 0) return legacy;
    return emptyDB();
  },

  save(data: AppDB): void {
    // Sync write to localStorage immediately (for legacy compatibility)
    const store = lsLoad();
    store[FULL_DB_KEY] = data;
    lsSave(store);

    // Async write to KV in background — don't block UI
    storage.set(FULL_DB_KEY, data).catch(err => {
      // KV failure is non-fatal — localStorage already saved
      console.warn('KV background save failed (localStorage fallback active):', err);
    });
  },

  async saveAsync(data: AppDB): Promise<void> {
    // Sync write to localStorage first — this ALWAYS succeeds and is the
    // source of truth for the current browser. Never let KV failure break this.
    try {
      const store = lsLoad();
      store[FULL_DB_KEY] = data;
      lsSave(store);
    } catch (lsErr) {
      console.warn('localStorage write failed:', lsErr);
    }

    // Then attempt KV write — but NEVER throw if it fails.
    // KV is a nice-to-have for cross-device sync, not a hard requirement.
    try {
      await storage.set(FULL_DB_KEY, data);
    } catch (kvErr) {
      // Non-fatal: localStorage already has the data. Cross-device sync
      // just won't work until KV is reachable again.
      console.warn('KV save failed (localStorage fallback active):', kvErr);
    }
  },
};
