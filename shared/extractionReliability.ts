export interface ExtractionFailure {
  label: string;
  status?: number;
  kind: 'session' | 'rate_limit' | 'server' | 'network';
}

export interface ExtractionReliabilityDecision {
  complete: boolean;
  allowFinancialVerdict: boolean;
  userMessage: string | null;
}

/**
 * C019 guard: infrastructure completeness is a prerequisite for a financial verdict.
 * Missing evidence caused by HTTP/session/rate-limit/network failure can never be
 * reinterpreted as evidence against the applicant.
 */
export function evaluateExtractionReliability(failures: ExtractionFailure[]): ExtractionReliabilityDecision {
  if (!failures.length) return { complete: true, allowFinancialVerdict: true, userMessage: null };
  if (failures.some((f) => f.kind === 'session' || f.status === 401)) {
    return { complete: false, allowFinancialVerdict: false, userMessage: 'Your session has expired. Please sign in again before generating the report.' };
  }
  if (failures.some((f) => f.kind === 'rate_limit' || f.status === 429)) {
    return { complete: false, allowFinancialVerdict: false, userMessage: 'Some submitted documents could not be processed because the analysis service is temporarily busy. Please retry the assessment.' };
  }
  return { complete: false, allowFinancialVerdict: false, userMessage: 'Some submitted documents could not be processed. No financial verdict was generated from an incomplete evidence set. Please retry the assessment.' };
}
