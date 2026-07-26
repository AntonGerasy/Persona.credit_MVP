export type DecisionStatus =
  | 'CONTRADICTED — material declared-versus-documented conflict'
  | 'REVIEW REQUIRED — ambiguous transaction evidence'
  | 'FINANCIAL ASSESSMENT COMPLETE — IDENTITY NOT PRODUCTION-VERIFIED'
  | 'ASSESSMENT COMPLETE — IDENTITY EVIDENCE SUBMITTED'
  | 'REVIEW REQUIRED — IDENTITY EVIDENCE INCOMPLETE';

export interface DecisionSignals {
  contradictionScore: number;
  reviewRequiredCount: number;
  qaSyntheticAccepted: boolean;
  identityUsable: boolean;
}

/**
 * Universal decision precedence from structured evidence.
 * A material contradiction always outranks the softer review fallback.
 */
export function deriveDecisionStatus(signals: DecisionSignals): DecisionStatus {
  if (Number(signals.contradictionScore) > 0) {
    return 'CONTRADICTED — material declared-versus-documented conflict';
  }
  if (Number(signals.reviewRequiredCount) > 0) {
    return 'REVIEW REQUIRED — ambiguous transaction evidence';
  }
  if (signals.qaSyntheticAccepted) {
    return 'FINANCIAL ASSESSMENT COMPLETE — IDENTITY NOT PRODUCTION-VERIFIED';
  }
  if (signals.identityUsable) {
    return 'ASSESSMENT COMPLETE — IDENTITY EVIDENCE SUBMITTED';
  }
  return 'REVIEW REQUIRED — IDENTITY EVIDENCE INCOMPLETE';
}

/**
 * QA fixtures have one deterministic identity reliability state. A free-form
 * model number can never raise or lower it. Production evidence remains bounded.
 */
export interface IdentityReliabilitySignals {
  qaSyntheticAccepted: boolean;
  identityUsable: boolean;
  identityRejected: boolean;
  extractedReliability: unknown;
}

export function deterministicIdentityReliability(signals: IdentityReliabilitySignals): number {
  if (signals.qaSyntheticAccepted) return 50;
  const parsed = Number(signals.extractedReliability ?? (signals.identityRejected ? 25 : 50));
  const bounded = Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 50));
  if (signals.identityUsable) return bounded;
  if (signals.identityRejected) return Math.min(35, bounded);
  return 50;
}
