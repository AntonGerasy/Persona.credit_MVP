import assert from 'node:assert/strict';
import { deriveReliablePeriod, finalizeExtractionResult, runIncomeEngine, runObligationsEngine } from '../api/extract-document';
import { deriveDecisionStatus, deterministicIdentityReliability } from '../src/lib/universalDecision';
import { calculateTransferScore } from '../src/scoreEngine';
import { evaluateIdentitySlotCompatibility } from '../api/_lib/documentSlotValidation';
type Tx = { date: string; description: string; counterparty: string; amount: number };

const run = (txs: Tx[], applicant = 'Test Applicant', employer = '', employment = 'Full-Time Employee') =>
  runIncomeEngine(txs, applicant, employer, employment, 2);

// C001 — single-token exclusion: a refund-like token in a recurring payer name
// cannot exclude salary by itself.
const tokenCollision = run([
  { date: '2026-04-05', description: 'Monthly payroll REFUND SYSTEMS LTD', counterparty: 'REFUND SYSTEMS LTD', amount: 12000 },
  { date: '2026-05-05', description: 'Monthly payroll REFUND SYSTEMS LTD', counterparty: 'REFUND SYSTEMS LTD', amount: 12100 },
]);
assert.equal(tokenCollision?.income_audit.counted_count, 2);
assert.equal(tokenCollision?.income_audit.excluded_count, 0);

// Genuine contextual refund remains excluded.
const genuineRefund = run([
  { date: '2026-04-18', description: 'Tax refund processed', counterparty: 'Revenue Authority', amount: 350 },
]);
assert.equal(genuineRefund?.income_audit.counted_count, 0);
assert.equal(genuineRefund?.income_audit.excluded_count, 1);
assert.equal(genuineRefund?.income_audit.excluded[0]?.reason, 'refund_or_reversal');

// C008 mitigation — conflicting earned-income and reversal signals are visible
// as review_required, never silently counted or excluded.
const ambiguous = run([
  { date: '2026-04-05', description: 'Monthly payroll payment reversal', counterparty: 'ACME PAYROLL LTD', amount: 5000 },
  { date: '2026-05-05', description: 'Monthly payroll payment reversal', counterparty: 'ACME PAYROLL LTD', amount: 5000 },
]);
assert.equal(ambiguous?.income_audit.review_required_count, 2);
assert.equal(ambiguous?.income_audit.counted_count, 0);
assert.equal(ambiguous?.income_audit.excluded_count, 0);

// Self-transfer guard remains deterministic.
const selfTransfer = run([
  { date: '2026-04-05', description: 'Transfer between own accounts', counterparty: 'Test Applicant', amount: 5000 },
]);
assert.equal(selfTransfer?.income_audit.excluded[0]?.reason, 'self_transfer_marker');

// C023 — a generic bank self-transfer phrase plus a named external legal entity is ambiguous,
// not proof of self-funding. Preserve it for manual review.
const namedEntityTransfer = run([
  { date: '2026-04-27', description: 'Online transfer from CHK 1632 Confirmation; CODECTIVE INC', counterparty: 'CODECTIVE INC', amount: 4000 },
], 'Anton Gerasymenko', 'Codective Inc', 'Employed — Full Time');
assert.equal(namedEntityTransfer?.income_audit.review_required_count, 1);
assert.equal(namedEntityTransfer?.income_audit.excluded_count, 0);

// Same marker without an external legal entity remains a self-transfer exclusion.
const plainMarkerTransfer = run([
  { date: '2026-04-27', description: 'Online transfer from CHK 1632', counterparty: 'Own account', amount: 4000 },
], 'Anton Gerasymenko', '', 'Employed — Full Time');
assert.equal(plainMarkerTransfer?.income_audit.review_required_count, 0);
assert.equal(plainMarkerTransfer?.income_audit.excluded_count, 1);


// C003 — QA identity reliability is independent of any model-provided number.
assert.equal(deterministicIdentityReliability({ qaSyntheticAccepted: true, identityUsable: false, identityRejected: false, extractedReliability: 99 }), 50);
assert.equal(deterministicIdentityReliability({ qaSyntheticAccepted: true, identityUsable: false, identityRejected: false, extractedReliability: 5 }), 50);
assert.equal(deterministicIdentityReliability({ qaSyntheticAccepted: false, identityUsable: true, identityRejected: false, extractedReliability: 85 }), 85);

// Declared≫verified contradiction guard: contradiction outranks review_required.
assert.match(deriveDecisionStatus({
  contradictionScore: 80,
  reviewRequiredCount: 4,
  qaSyntheticAccepted: true,
  identityUsable: false,
}), /^CONTRADICTED/);

// Ambiguous evidence without a material contradiction remains review-required.
assert.match(deriveDecisionStatus({
  contradictionScore: 0,
  reviewRequiredCount: 1,
  qaSyntheticAccepted: false,
  identityUsable: true,
}), /^REVIEW REQUIRED — ambiguous/);

// C010 — full-score pipeline coupling: clean verified evidence with no contradiction
// must not receive a contradiction penalty or an unexplained score collapse.
const cleanScore = calculateTransferScore({
  identity_reliability: 80,
  financial_stability: 75,
  migration_resilience: 70,
  country_transferability: 65,
  behavioral_consistency: 70,
  fraud_risk: 10,
  contradiction_score: 0,
  overall_confidence: 0.9,
  evidence_strength: 85,
  overall_uncertainty: 10,
  income_evidence_factor: 1,
});
assert.equal(cleanScore.breakdown.contradiction_penalty, 0);
assert.ok(cleanScore.finalScore >= 650, `Expected clean verified profile to remain established or better, got ${cleanScore.finalScore}`);
assert.match(deriveDecisionStatus({
  contradictionScore: 0,
  reviewRequiredCount: 0,
  qaSyntheticAccepted: false,
  identityUsable: true,
}), /^ASSESSMENT COMPLETE/);

// C010 — a material declared-vs-verified contradiction must apply a score penalty
// and remain CONTRADICTED even if some transactions also require review.
const contradictedScore = calculateTransferScore({
  identity_reliability: 80,
  financial_stability: 75,
  migration_resilience: 70,
  country_transferability: 65,
  behavioral_consistency: 70,
  fraud_risk: 10,
  contradiction_score: 80,
  overall_confidence: 0.9,
  evidence_strength: 85,
  overall_uncertainty: 10,
  income_evidence_factor: 0.25,
});
assert.equal(contradictedScore.breakdown.contradiction_penalty, 20);
assert.ok(contradictedScore.finalScore < cleanScore.finalScore, 'Material contradiction must reduce the final score');
assert.match(deriveDecisionStatus({
  contradictionScore: 80,
  reviewRequiredCount: 3,
  qaSyntheticAccepted: false,
  identityUsable: true,
}), /^CONTRADICTED/);

// C011 — cross-slot document type acceptance. A financial document cannot become
// a green Identity-slot success merely because it contains the applicant name.
const bankStatementInIdentitySlot = evaluateIdentitySlotCompatibility({
  documentCategory: 'bank_statement',
  identityDocumentStructure: false,
  issuingAuthorityPresent: false,
  holderIdentityPresent: true, // statements commonly contain the applicant name
  transactionActivityPresent: true,
  accountStatementStructurePresent: true,
  financialAccountPresent: true,
});
assert.equal(bankStatementInIdentitySlot.decision, 'reject');

const genuineIdentity = evaluateIdentitySlotCompatibility({
  documentCategory: 'identity',
  identityDocumentStructure: true,
  issuingAuthorityPresent: true,
  holderIdentityPresent: true,
  transactionActivityPresent: false,
  accountStatementStructurePresent: false,
  financialAccountPresent: false,
});
assert.equal(genuineIdentity.decision, 'accept');

const ambiguousIdentity = evaluateIdentitySlotCompatibility({
  documentCategory: 'unknown',
  identityDocumentStructure: true,
  issuingAuthorityPresent: false,
  holderIdentityPresent: true,
  transactionActivityPresent: false,
  accountStatementStructurePresent: false,
  financialAccountPresent: false,
});
assert.equal(ambiguousIdentity.decision, 'review');


// v35.3.1 — malformed OCR dates cannot stretch a recent statement to years.
const periodGuard = deriveReliablePeriod([
  { date: '200-02-14' },
  { date: '2025-12-07' },
  { date: '2026-05-31' },
], 6);
assert.equal(periodGuard.months, 6);

// v35.3.1 — cancellation/reversal credits in native script are not income.
const nativeCancellation = run([
  { date: '2026-05-28', description: 'Скасування. Nayax LLC', counterparty: 'Nayax LLC', amount: 111.03 },
]);
assert.equal(nativeCancellation?.income_audit.counted_count, 0);
assert.equal(nativeCancellation?.income_audit.excluded[0]?.reason, 'refund_or_reversal');

// Transliteration fallback is defensive only; native script remains the preferred transcript.
const transliteratedCancellation = run([
  { date: '2026-05-28', description: 'Skasuvannia. Nayax LLC', counterparty: 'Nayax LLC', amount: 111.03 },
]);
assert.equal(transliteratedCancellation?.income_audit.excluded[0]?.reason, 'refund_or_reversal');

// v35.3.1 — recurring ordinary merchant spend with a discretionary MCC is not an obligation.
const merchantObligation = runObligationsEngine([
  { date: '2026-04-10', description: 'Primo Water', counterparty: 'Primo Water', mcc: '5814', amount: 137.08 },
  { date: '2026-05-10', description: 'Primo Water', counterparty: 'Primo Water', mcc: '5814', amount: 137.08 },
], 'Test Applicant', 2);
assert.equal(merchantObligation?.obligations_audit.counted_count, 0);

// Applicant name in ACH metadata does not override explicit credit-card payment semantics.
const cardPayment = runObligationsEngine([
  { date: '2026-04-27', description: 'CAPITAL ONE DES:CRD PMT INDN:Anton Gerasymenko', counterparty: 'Anton Gerasymenko', amount: 232 },
  { date: '2026-05-27', description: 'CAPITAL ONE DES:CRD PMT INDN:Anton Gerasymenko', counterparty: 'Anton Gerasymenko', amount: 232 },
], 'Anton Gerasymenko', 2);
assert.equal(cardPayment?.obligations_audit.counted_count, 2);
assert.ok(['loan_or_credit', 'recurring_payment'].includes(String(cardPayment?.obligations_audit.counted[0]?.reason || '')));


// v35.3.2 — a strong cancellation stays excluded even when the same merchant repeats often.
const repeatedCancellation = run(Array.from({ length: 6 }, (_, i) => ({
  date: `2026-05-${String(10 + i).padStart(2, '0')}`,
  description: 'Скасування. Vending Merchant',
  counterparty: 'Vending Merchant',
  amount: 100,
})));
assert.equal(repeatedCancellation?.income_audit.review_required_count, 0);
assert.equal(repeatedCancellation?.income_audit.excluded_count, 6);

// Safe token matching: substrings such as "rent" in "current" and "emi" in "premium"
// must not manufacture obligations, including when a discretionary MCC is present.
const substringFalsePositives = runObligationsEngine([
  { date: '2026-04-10', description: 'PREMIUM OUTLET STORE', counterparty: 'Premium Outlet', mcc: '5999', amount: 90 },
  { date: '2026-05-10', description: 'CURRENT ACCOUNT PURCHASE', counterparty: 'Current Market', mcc: '5999', amount: 95 },
  { date: '2026-05-11', description: 'REMITTANCE TO FAMILY', counterparty: 'Family Transfer', mcc: '5999', amount: 100 },
], 'Test Applicant', 2);
assert.equal(substringFalsePositives?.obligations_audit.counted_count, 0);

// A plausible-year OCR outlier cannot stretch six occupied statement months to a decade.
const plausibleYearOutlier = deriveReliablePeriod([
  { date: '2016-01-10' },
  { date: '2025-12-07' }, { date: '2026-01-07' }, { date: '2026-02-07' },
  { date: '2026-03-07' }, { date: '2026-04-07' }, { date: '2026-05-31' },
], 6);
assert.equal(plausibleYearOutlier.months, 6);



// v35.3.4 — readable bank evidence cannot be discarded by model is_usable=false.
// The guard is based on a deterministic audit transcript, not bank/country/currency/amount.
const readableButModelRejected = finalizeExtractionResult({
  document_type: 'Bank Statement',
  issuing_institution: 'Generic International Bank',
  is_usable: false,
  rejection_reason: 'Income pattern is irregular',
  extraction_completeness: 'partial',
  period_months: 1,
  credit_transactions: [
    { date: '2026-04-15', description: 'Incoming transfer', counterparty: 'Private Sender', amount: 1200 },
  ],
  debit_transactions: [
    { date: '2026-04-20', description: 'Groceries', counterparty: 'Local Market', amount: 100 },
  ],
}, 'Test Applicant', '', 'Self-Employed / Freelance');
assert.equal(readableButModelRejected.is_usable, true);
assert.equal(readableButModelRejected.rejection_reason, '');
assert.equal(readableButModelRejected.income_audit?.engine, 'deterministic');

// v35.3.4 — US-style numeric dates are inferred from the document itself, not country/bank.
// A statement spanning Apr 14–May 11 is ~one month of activity even though it crosses
// two calendar labels; the same divider must drive obligations.
const monthFirstStatement = finalizeExtractionResult({
  document_type: 'Account Statement',
  issuing_institution: 'Generic Institution',
  is_usable: true,
  extraction_completeness: 'complete',
  period_months: 2,
  credit_transactions: [
    { date: '04/21/26', description: 'Refund processed', counterparty: 'Tax Authority', amount: 12 },
  ],
  debit_transactions: [
    { date: '04/27/26', description: 'CRD PMT', counterparty: 'Card Account', amount: 243 },
    { date: '04/28/26', description: 'CARD PAYMENT', counterparty: 'AppleCard', amount: 500 },
    { date: '04/28/26', description: 'CARD PAYMENT', counterparty: 'Robinhood Card', amount: 275 },
    { date: '05/01/26', description: 'CARD PAYMENT', counterparty: 'AppleCard', amount: 200 },
  ],
}, 'Test Applicant', '', 'Self-Employed / Freelance');
assert.equal(monthFirstStatement.period_months, 1);
assert.match(String(monthFirstStatement.period_covered), /^2026-04 to 2026-05 \(1 month\(s\) of activity;/);
assert.equal(monthFirstStatement.estimated_monthly_obligations, 1218);

// v35.3.4 — day-first documents follow the same inference path. This represents the
// dominant numeric format across many non-US statements without hardcoding a country.
const dayFirstStatement = finalizeExtractionResult({
  document_type: 'Bank Statement',
  issuing_institution: 'Generic International Bank',
  is_usable: true,
  extraction_completeness: 'complete',
  period_months: 2,
  credit_transactions: [
    { date: '27/04/26', description: 'Incoming transfer', counterparty: 'Client A', amount: 1000 },
    { date: '01/05/26', description: 'Incoming transfer', counterparty: 'Client A', amount: 1000 },
  ],
  debit_transactions: [],
}, 'Test Applicant', '', 'Freelance');
assert.equal(dayFirstStatement.period_months, 1);
assert.match(String(dayFirstStatement.period_covered), /^2026-04 to 2026-05 \(1 month\(s\) of activity;/);

console.log('Golden engine smoke: 26 universal class guards passed.');
