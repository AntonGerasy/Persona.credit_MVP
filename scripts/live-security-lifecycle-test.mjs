const base = (process.env.BASE_URL || 'https://www.persona.credit').replace(/\/$/, '');

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const emailA = `security-a-${suffix}@example.com`;
const emailB = `security-b-${suffix}@example.com`;
const password = `Pc!${suffix}Aa9`;
const password2 = `Pc!${suffix}Bb8`;
const shareId = `SEC-${suffix}`;

async function json(path, body, token, method = 'POST') {
  const r = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { 'x-pc-session': token } : {}) },
    ...(method === 'GET' ? {} : { body: JSON.stringify(body) }),
  });
  const data = await r.json().catch(() => ({}));
  return { r, data };
}
const ok = (condition, label) => { if (!condition) throw new Error(`FAIL: ${label}`); console.log(`✓ ${label}`); };

let tokenA = '', tokenB = '';
try {
  const health = await json('/api/production-readiness', null, null, 'GET');
  ok(health.r.ok && health.data.safeForRealUsers === true, 'production QA guard is safe');
  ok(health.data.qaFixtureMode === 'disabled', 'server QA fixture mode is disabled');
  ok(health.data.storageConfigured === true, 'production storage is configured');

  // PB1 AI-cost surface: paid Gemini endpoints must not be callable anonymously.
  for (const path of ['/api/validate-file', '/api/extract-document', '/api/run-agent', '/api/synthesize']) {
    const unauth = await json(path, {});
    ok(unauth.r.status === 401, `${path} rejects unauthenticated requests`);
  }

  const a = await json('/api/auth', { action: 'signup', email: emailA, password });
  const b = await json('/api/auth', { action: 'signup', email: emailB, password });
  ok(a.r.ok && a.data.token, 'account A signup/auth');
  ok(b.r.ok && b.data.token, 'account B signup/auth');
  tokenA = a.data.token; tokenB = b.data.token;

  const ownKeyA = `pc:user:${emailA}`;
  const ownKeyB = `pc:user:${emailB}`;
  ok((await json('/api/kv', { op: 'set', key: ownKeyA, value: { marker: 'A', dashboardResult: { shareId } } }, tokenA)).r.ok, 'A can write own record');
  ok((await json('/api/kv', { op: 'set', key: ownKeyB, value: { marker: 'B' } }, tokenB)).r.ok, 'B can write own record');
  ok((await json('/api/kv', { op: 'get', key: ownKeyB }, tokenA)).r.status === 403, 'A cannot read B data');
  ok((await json('/api/kv', { op: 'get', key: ownKeyA }, tokenB)).r.status === 403, 'B cannot read A data');

  const shareKey = `pc:share:${shareId}`;
  const published = await json('/api/kv', { op: 'set', key: shareKey, value: { report: { owner: 'A' }, expiresAt: Date.now() + 3600000 } }, tokenA);
  ok(published.r.ok, 'A can publish own share link');
  const publicRead = await json('/api/kv', { op: 'get', key: shareKey });
  ok(publicRead.r.ok && publicRead.data.value?.ownerEmail === emailA, 'public share works and owner is server-stamped');
  ok((publicRead.r.headers.get('x-robots-tag') || '').includes('noindex'), 'public share API is noindex');
  ok((publicRead.r.headers.get('cache-control') || '').includes('no-store'), 'public share API is not cached');
  ok((await json('/api/kv', { op: 'set', key: shareKey, value: { report: { owner: 'B' } } }, tokenB)).r.status === 403, 'B cannot overwrite A share link');
  ok((await json('/api/kv', { op: 'delete', key: shareKey }, tokenB)).r.status === 403, 'B cannot revoke A share link');

  const historyPrefix = `pc:history:${emailA}:`;
  const writes = Array.from({ length: 5 }, (_, i) => json('/api/kv', { op: 'set', key: `${historyPrefix}${Date.now()}-${i}`, value: { assessment: i } }, tokenA));
  const writeResults = await Promise.all(writes);
  ok(writeResults.every(x => x.r.ok), 'parallel assessment writes succeed');
  const listed = await json('/api/kv', { op: 'keys', prefix: historyPrefix }, tokenA);
  ok(listed.r.ok && listed.data.keys.length >= 5, 'parallel assessments remain separate');

  const changed = await json('/api/auth', { action: 'change_password', token: tokenA, currentPassword: password, newPassword: password2 });
  ok(changed.r.ok && changed.data.token, 'password change returns a fresh session');
  const oldTokenRead = await json('/api/kv', { op: 'get', key: ownKeyA }, tokenA);
  ok(oldTokenRead.r.status === 401, 'old session is revoked after password change');
  tokenA = changed.data.token;
  ok((await json('/api/kv', { op: 'get', key: ownKeyA }, tokenA)).r.ok, 'fresh session remains valid');

  const deleted = await json('/api/auth', { action: 'delete_account', token: tokenA, password: password2 });
  ok(deleted.r.ok, 'account A deletion succeeds');
  ok(deleted.data.deletionEvidence?.deletedUserRecord === true, 'account deletion removes stored user/report/document record');
  ok(Number(deleted.data.deletionEvidence?.deletedHistoryCount || 0) >= 5, 'account deletion removes assessment history records');
  ok((await json('/api/auth', { action: 'login', email: emailA, password: password2 })).r.status === 401, 'deleted account cannot log in');
  ok((await json('/api/kv', { op: 'get', key: shareKey })).r.status === 200 && (await json('/api/kv', { op: 'get', key: shareKey })).data.value === null, 'account deletion revokes share link');

  console.log('\nSecurity & lifecycle live test: PASSED');
} finally {
  if (tokenB) await json('/api/auth', { action: 'delete_account', token: tokenB, password }).catch(() => {});
}
