import fs from 'node:fs';
const checks = [
  ['legal privacy route', fs.readFileSync('src/App.tsx','utf8').includes("path === '/privacy'")],
  ['legal terms route', fs.readFileSync('src/App.tsx','utf8').includes("path === '/terms'")],
  ['share recipient disclaimer', fs.readFileSync('src/pages/ReportViewerPage.tsx','utf8').includes('must not be used as the sole basis')],
  ['provider QA-note filter', fs.readFileSync('src/lib/providerFacing.ts','utf8').includes('fabricated data')],
  ['deletion evidence API', fs.readFileSync('api/auth.ts','utf8').includes('deletedUserRecord, deletedHistoryCount, revokedShareCount')],
  ['deletion evidence live test', fs.readFileSync('scripts/live-security-lifecycle-test.mjs','utf8').includes('removes stored user/report/document record')],
];
for (const [name, pass] of checks) {
  if (!pass) throw new Error(`FAIL: ${name}`);
  console.log(`✓ ${name}`);
}
console.log(`Release polish check: ${checks.length}/${checks.length} passed`);
