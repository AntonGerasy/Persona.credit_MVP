import assert from 'node:assert/strict';
import {
  evaluateExtractionReliability,
  makeProcessingFailurePayload,
  mergeExtractionChunks,
  processingFailureFromParsedExtraction,
  reconcileStatementControlTotals,
} from '../api/_lib/extractionReliability.ts';

// Existing C019 transport/session guards.
const complete = evaluateExtractionReliability([]);
assert.equal(complete.complete, true);
assert.equal(complete.allowFinancialVerdict, true);
for (const failure of [
  { label: 'Statement B', status: 401, kind: 'session' as const },
  { label: 'Statement B', status: 429, kind: 'rate_limit' as const },
  { label: 'Statement B', status: 503, kind: 'server' as const },
  { label: 'Statement B', kind: 'network' as const },
  { label: 'Financial agent', status: 401, kind: 'session' as const },
]) {
  const d = evaluateExtractionReliability([failure]);
  assert.equal(d.allowFinancialVerdict, false, `failure ${failure.kind} must block financial verdict`);
}

// C021: HTTP 200 with an internal processing failure must still block the financial verdict.
const c021Failure = processingFailureFromParsedExtraction({ processing_failed: true }, 'Long statement');
assert.ok(c021Failure);
assert.equal(evaluateExtractionReliability([c021Failure!]).allowFinancialVerdict, false);

// C022: technical processing failures never become authenticity accusations.
const technicalFallback = makeProcessingFailurePayload('Ukraine', 1, 2);
assert.deepEqual(technicalFallback.authenticity_concerns, []);
assert.equal(technicalFallback.processing_failed, true);

const tx = (date: string, counterparty: string, amount: number, description = counterparty) => ({ date, counterparty, amount, description });
const sixIdentical = Array.from({ length: 6 }, () => tx('2026-03-12', 'Поповнення картки', 25000, 'Поповнення картки'));
const twoIndistinguishable = [
  tx('2026-04-18', 'Primo Water Corporatio, Vista, US', 137.08, 'Primo Water Corporatio, Vista, US 02:01:25'),
  tx('2026-04-18', 'Primo Water Corporatio, Vista, US', 137.08, 'Primo Water Corporatio, Vista, US 02:01:25'),
];

const chunk1: any = {
  document_type: 'Bank Statement', issuing_institution: 'Synthetic Bank', currency_code: 'UAH', is_usable: true,
  chunk_page_start: 1, chunk_page_end: 2, document_page_count: 4,
  credit_transactions: sixIdentical,
  debit_transactions: [],
  statement_control_totals: {
    available: false, has_opening_balance: true, has_closing_balance: false, has_total_credits: true, has_total_debits: false,
    opening_balance: 12480.35, closing_balance: 0, total_credits: 150000, total_debits: 0,
  },
};
const chunk2: any = {
  document_type: 'Bank Statement', issuing_institution: 'Synthetic Bank', currency_code: 'UAH', is_usable: true,
  chunk_page_start: 3, chunk_page_end: 4, document_page_count: 4,
  credit_transactions: [], debit_transactions: twoIndistinguishable,
  statement_control_totals: {
    available: false, has_opening_balance: false, has_closing_balance: true, has_total_credits: false, has_total_debits: true,
    opening_balance: 0, closing_balance: 162206.19, total_credits: 0, total_debits: 274.16,
  },
};

// C024: deterministic merge preserves identical evidence rows; no content-based dedupe.
const merged = mergeExtractionChunks([chunk1, chunk2]);
assert.equal(merged.credit_transactions?.length, 6);
assert.equal(merged.debit_transactions?.length, 2);
assert.deepEqual(merged.debit_transactions?.[0], merged.debit_transactions?.[1]);

// Controls can be printed on different pages/chunks and must assemble into one statement-level check.
assert.equal(merged.statement_control_totals?.available, true);
const reconciled = reconcileStatementControlTotals(merged);
assert.equal(reconciled.applicable, true);
assert.equal(reconciled.complete, true);

// Missing row -> arithmetic mismatch -> processing must be treated as incomplete.
const missingOne = { ...merged, credit_transactions: merged.credit_transactions?.slice(0, 5) };
assert.equal(reconcileStatementControlTotals(missingOne).complete, false);

// No controls means check is not applicable, not a failure.
const withoutControls = mergeExtractionChunks([{ ...chunk1, statement_control_totals: undefined }]);
const noControlCheck = reconcileStatementControlTotals(withoutControls);
assert.equal(noControlCheck.applicable, false);
assert.equal(noControlCheck.complete, true);

// One-page document remains exactly one chunk.
const onePage = mergeExtractionChunks([{ ...chunk1, document_page_count: 1, chunk_page_start: 1, chunk_page_end: 1 }]);
assert.equal(onePage.document_page_count, 1);
assert.equal(onePage.chunk_page_end, 1);

// A failed chunk poisons the whole document: COMPLETE or RETRY, never PARTIAL.
const failedMerge = mergeExtractionChunks([chunk1, { ...chunk2, processing_failed: true }]);
assert.equal(failedMerge.processing_failed, true);

console.log('Extraction reliability + C021/C024 guards: PASSED (13/13)');
