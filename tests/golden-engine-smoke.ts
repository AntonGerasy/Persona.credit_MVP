import assert from 'node:assert/strict';
import { runIncomeEngine } from '../api/extract-document';
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

console.log('Golden engine smoke: 13 universal class guards passed.');
