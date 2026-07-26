import fs from 'node:fs';

const files = {
  report: fs.readFileSync('src/pages/ReportViewerPage.tsx', 'utf8'),
  dashboard: fs.readFileSync('src/pages/Dashboard.tsx', 'utf8'),
  pdf: fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8'),
  landing: fs.readFileSync('src/pages/LandingPage.tsx', 'utf8'),
  legal: fs.readFileSync('src/pages/LegalPage.tsx', 'utf8'),
};

const checks = [
  ['shared report has recipient disclaimer', files.report.includes('must not be used as the sole basis')],
  ['shared report exposes material conflict status', files.report.includes('Material Evidence Conflict')],
  ['shared report exposes manual review status', files.report.includes('Manual Review Required')],
  ['unsupported percentile is not shown in shared report', !files.report.includes('th percentile')],
  ['shared report score visualization uses 0-1000 scale', files.report.includes('score / 1000')],
  ['dashboard uses neutral reconciliation label', files.dashboard.includes('Evidence Reconciled')],
  ['PDF avoids Prime-status marketing language', !files.pdf.includes('Achieve Prime status')],
  ['dashboard avoids Prime-threshold marketing language', !files.dashboard.includes('Prime thresholds')],
  ['landing carries informational disclaimer', files.landing.includes('not a credit bureau report')],
  ['privacy and terms routes are implemented', files.legal.includes('Privacy Policy') && files.legal.includes('Terms of Service')],
];

let passed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (ok) passed++;
}
if (passed !== checks.length) {
  console.error(`Provider acceptance check: FAILED (${passed}/${checks.length})`);
  process.exit(1);
}
console.log(`Provider acceptance check: PASSED (${passed}/${checks.length})`);
