import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'api');
const apiRoot = apiDir + path.sep;
const importRe = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"](\.[^'"]+)['"]/g;
const extensions = ['', '.ts', '.tsx', '.js', '.mjs', '.cjs', '/index.ts', '/index.tsx', '/index.js'];
let failures = [];

for (const entry of fs.readdirSync(apiDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
  const file = path.join(apiDir, entry.name);
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(importRe)) {
    const spec = match[1];
    const base = path.resolve(path.dirname(file), spec);
    if (!(base === apiDir || base.startsWith(apiRoot))) {
      failures.push(`${entry.name}: relative import escapes api/: ${spec}`);
      continue;
    }
    if (!extensions.some(ext => fs.existsSync(base + ext))) {
      failures.push(`${entry.name}: relative import does not resolve: ${spec}`);
    }
  }
}

if (failures.length) {
  console.error('API bundle boundary check: FAILED');
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}
console.log('API bundle boundary check: PASSED');
