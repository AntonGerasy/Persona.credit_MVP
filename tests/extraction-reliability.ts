import assert from 'node:assert/strict';
import { evaluateExtractionReliability } from '../api/_lib/extractionReliability.ts';

const complete = evaluateExtractionReliability([]);
assert.equal(complete.complete, true);
assert.equal(complete.allowFinancialVerdict, true);

for (const failure of [
  { label: 'Statement B', status: 401, kind: 'session' as const },
  { label: 'Statement B', status: 429, kind: 'rate_limit' as const },
  { label: 'Statement B', status: 503, kind: 'server' as const },
  { label: 'Statement B', kind: 'network' as const },
  // Agent non-200 must enter the same C019 infrastructure path.
  { label: 'Financial agent', status: 401, kind: 'session' as const },
]) {
  const d = evaluateExtractionReliability([failure]);
  assert.equal(d.complete, false);
  assert.equal(d.allowFinancialVerdict, false, `failure ${failure.kind} must block financial verdict`);
}

console.log('Extraction reliability guard: PASSED (6/6)');
