import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'api');
const apiRoot = apiDir + path.sep;
const importRe = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"](\.[^'"]+)['"]/g;
const sourceExtensions = ['.ts', '.tsx', '.js', '.mjs', '.cjs'];
let failures = [];

function sourceTargetForRuntimeSpecifier(base, spec) {
  // ESM functions execute emitted .js. A local runtime specifier must carry an
  // explicit extension. For a .js specifier in TS source, accept a sibling .ts
  // source file because Vercel/TypeScript emits it as .js in the function bundle.
  const ext = path.extname(spec);
  if (!ext) return null;
  if (ext === '.js') {
    const tsCandidate = base.slice(0, -3) + '.ts';
    const jsCandidate = base;
    if (fs.existsSync(tsCandidate)) return tsCandidate;
    if (fs.existsSync(jsCandidate)) return jsCandidate;
    return null;
  }
  return fs.existsSync(base) ? base : null;
}

for (const entry of fs.readdirSync(apiDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
  const file = path.join(apiDir, entry.name);
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(importRe)) {
    const spec = match[1];
    const base = path.resolve(path.dirname(file), spec);
    const baseNoRuntimeExt = path.resolve(path.dirname(file), spec.replace(/\.js$/, ''));
    if (!(base === apiDir || base.startsWith(apiRoot) || baseNoRuntimeExt.startsWith(apiRoot))) {
      failures.push(`${entry.name}: relative import escapes api/: ${spec}`);
      continue;
    }
    if (!path.extname(spec)) {
      failures.push(`${entry.name}: ESM runtime import must use an explicit extension: ${spec}`);
      continue;
    }
    if (!sourceTargetForRuntimeSpecifier(base, spec)) {
      failures.push(`${entry.name}: relative import does not resolve to a source/runtime target: ${spec}`);
    }
  }
}

if (failures.length) {
  console.error('API bundle/runtime resolution check: FAILED');
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}
console.log('API bundle/runtime resolution check: PASSED');
