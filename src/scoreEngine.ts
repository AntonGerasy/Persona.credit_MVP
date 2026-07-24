
export interface ScoringInputs {
  identity_reliability: number;
  financial_stability: number;
  migration_resilience: number;
  country_transferability: number;
  behavioral_consistency: number;
  fraud_risk: number;
  contradiction_score: number;
  overall_confidence: number;
  evidence_strength: number;
  overall_uncertainty: number;
  // 0-1 multiplier reflecting how well declared income is backed by documents.
  // 1.0 = verified, 0.85 = partial, 0.25 = declared-only, 0.0 = contradicted.
  // Income-driven pillars are scaled by this so an unverified profile cannot score high.
  income_evidence_factor?: number;
}

export interface ScoreBreakdown {
  base_score: number;
  contradiction_penalty: number;
  confidence_adjustment: number;
  evidence_adjustment: number;
  final_adjusted_score: number;
}

export interface ScoringResult {
  finalScore: number;
  normalizedScore: number;
  level: string;
  breakdown: ScoreBreakdown;
}

/**
 * Maps a numeric score to a qualitative level.
 */
export function calculateLevel(score: number): string {
  if (score >= 850) return 'Exceptional';
  if (score >= 750) return 'Strong';
  if (score >= 650) return 'Established';
  if (score >= 550) return 'Developing';
  if (score >= 450) return 'Limited';
  return 'Critical';
}

/**
 * Deterministic Scoring Engine
 * 
 * This engine calculates the proprietary TransferScore (0-1000 range) based on 
 * structured inputs from the AI analysis agents. 
 */
export function calculateTransferScore(inputs: ScoringInputs): ScoringResult {
  // Normalize inputs to ensure they are within expected ranges
  const idRel = Math.max(0, Math.min(100, inputs.identity_reliability));
  const finStab = Math.max(0, Math.min(100, inputs.financial_stability));
  const migRes = Math.max(0, Math.min(100, inputs.migration_resilience));
  const ctryTrns = Math.max(0, Math.min(100, inputs.country_transferability));
  const behCons = Math.max(0, Math.min(100, inputs.behavioral_consistency));
  const fraudRisk = Math.max(0, Math.min(100, inputs.fraud_risk));
  const contraScore = Math.max(0, Math.min(100, inputs.contradiction_score));
  const confidence = Math.max(0, Math.min(1, inputs.overall_confidence));
  const evStrength = Math.max(0, Math.min(100, inputs.evidence_strength));
  const uncertainty = Math.max(0, Math.min(100, inputs.overall_uncertainty));
  // Evidence backing for income (0-1). Scales the income-driven pillars so that
  // self-declared-but-undocumented income cannot inflate the score.
  const incomeFactor = Math.max(0, Math.min(1, inputs.income_evidence_factor ?? 1));

  // STEP 1: Base weighted score
  // financial_stability and migration_resilience are income-driven → scaled by incomeFactor.
  const baseScore = 
    (idRel * 0.22) + 
    (finStab * incomeFactor * 0.26) + 
    (migRes * incomeFactor * 0.14) + 
    (ctryTrns * 0.16) + 
    (behCons * 0.10) + 
    ((100 - fraudRisk) * 0.12);

  // STEP 2: Contradiction penalty
  const contradictionPenalty = contraScore * 0.25;
  let adjustedScore = baseScore - contradictionPenalty;

  // STEP 3: Confidence adjustment (0.7 to 1.0 multiplier)
  const confidenceMultiplier = 0.7 + (confidence * 0.3);
  const confidenceAdjustment = Math.abs(adjustedScore * (1 - confidenceMultiplier));
  adjustedScore = adjustedScore * confidenceMultiplier;

  // STEP 4: Evidence adjustment
  const evidenceAdjustment = (evStrength - uncertainty) * 0.05;
  adjustedScore = adjustedScore + evidenceAdjustment;

  // STEP 5: Clamp 0-100
  const finalAdjustedScore = Math.max(0, Math.min(100, adjustedScore));

  // STEP 6: Convert to proprietary 0-1000 range
  const finalScore = Math.round(finalAdjustedScore * 10);

  return {
    finalScore,
    normalizedScore: finalAdjustedScore,
    level: calculateLevel(finalScore),
    breakdown: {
      base_score: Number(baseScore.toFixed(2)),
      contradiction_penalty: Number(contradictionPenalty.toFixed(2)),
      confidence_adjustment: Number(confidenceAdjustment.toFixed(2)),
      evidence_adjustment: Number(evidenceAdjustment.toFixed(2)),
      final_adjusted_score: Number(finalAdjustedScore.toFixed(2))
    }
  };
}
