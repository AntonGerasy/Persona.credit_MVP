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

export interface StatementControlTotals {
  available: boolean;
  has_opening_balance?: boolean;
  has_closing_balance?: boolean;
  has_total_credits?: boolean;
  has_total_debits?: boolean;
  opening_balance: number;
  closing_balance: number;
  total_credits: number;
  total_debits: number;
}

export interface ExtractionChunkLike {
  document_type?: string;
  issuing_institution?: string;
  issuing_country?: string;
  detected_language?: string;
  period_covered?: string;
  period_months?: number;
  account_holder_name?: string;
  account_holder_name_match?: string;
  currency_code?: string;
  usd_rate_estimate?: number;
  credit_transactions?: any[];
  debit_transactions?: any[];
  average_monthly_inflow?: number;
  ending_balance?: number;
  income_regularity?: string;
  income_sources_detected?: string[];
  salary_deposits_detected?: boolean;
  salary_deposit_count?: number;
  estimated_monthly_obligations?: number;
  asset_type?: string;
  asset_estimated_value_local?: number;
  asset_ownership_confirmed?: boolean;
  legibility_score?: number;
  authenticity_concerns?: string[];
  is_usable?: boolean;
  rejection_reason?: string;
  analyst_note?: string;
  processing_failed?: boolean;
  document_page_count?: number;
  chunk_page_start?: number;
  chunk_page_end?: number;
  statement_control_totals?: StatementControlTotals;
}

export interface ControlReconciliationResult {
  applicable: boolean;
  complete: boolean;
  extractedCredits: number;
  extractedDebits: number;
  expectedCredits: number;
  expectedDebits: number;
  balanceDelta: number;
  tolerance: number;
}

/**
 * C019/C021 guard: infrastructure completeness is a prerequisite for a financial verdict.
 * Missing evidence caused by HTTP/session/rate-limit/network/server processing failure can never
 * be reinterpreted as evidence against the applicant.
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


/** C021/C022 canonical technical-failure payload. Technical failures are never authenticity judgements. */
export function makeProcessingFailurePayload(originCountry = 'Unknown', pageStart = 1, pageEnd = 1) {
  return {
    processing_failed: true,
    document_type: 'Unknown',
    issuing_institution: 'Unknown',
    issuing_country: originCountry || 'Unknown',
    detected_language: 'Unknown',
    period_covered: '',
    period_months: 0,
    account_holder_name: '',
    account_holder_name_match: 'Cannot determine',
    currency_code: '',
    credit_transactions: [],
    debit_transactions: [],
    document_page_count: 0,
    chunk_page_start: pageStart,
    chunk_page_end: pageEnd,
    statement_control_totals: {
      available: false,
      has_opening_balance: false,
      has_closing_balance: false,
      has_total_credits: false,
      has_total_debits: false,
      opening_balance: 0,
      closing_balance: 0,
      total_credits: 0,
      total_debits: 0,
    },
    average_monthly_inflow: 0,
    income_audit: { engine: 'llm_fallback', note: 'Document processing failed.' },
    ending_balance: 0,
    income_regularity: 'Unknown',
    income_sources_detected: [],
    salary_deposits_detected: false,
    salary_deposit_count: 0,
    estimated_monthly_obligations: 0,
    obligations_audit: { engine: 'llm_fallback', note: 'Document processing failed.' },
    asset_type: 'N/A',
    asset_estimated_value_local: 0,
    asset_ownership_confirmed: false,
    legibility_score: 0,
    authenticity_concerns: [] as string[],
    is_usable: false,
    rejection_reason: 'Document processing failed. Please retry.',
    analyst_note: 'Document could not be processed. Retry required.',
  };
}

/** C021: a HTTP-200 fallback with processing_failed is still a hard extraction failure. */
export function processingFailureFromParsedExtraction(parsed: any, label: string): ExtractionFailure | null {
  return parsed?.processing_failed === true ? { label, kind: 'server' } : null;
}

const nonEmpty = (value: any): boolean => {
  if (typeof value === 'string') return value.trim() !== '' && !/^unknown$/i.test(value.trim());
  return value !== undefined && value !== null;
};

/**
 * C024 deterministic assembly. No content-based de-duplication is performed: identical rows are
 * distinct evidence unless the source document itself proves otherwise.
 */
export function mergeExtractionChunks(chunks: ExtractionChunkLike[]): ExtractionChunkLike {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return { processing_failed: true, credit_transactions: [], debit_transactions: [] };
  }
  if (chunks.some((c) => c?.processing_failed === true)) {
    return { processing_failed: true, credit_transactions: [], debit_transactions: [] };
  }

  const sorted = [...chunks].sort((a, b) => Number(a.chunk_page_start || 0) - Number(b.chunk_page_start || 0));
  const first = sorted[0] || {};
  const merged: ExtractionChunkLike = {
    ...first,
    processing_failed: false,
    credit_transactions: sorted.flatMap((c) => Array.isArray(c.credit_transactions) ? c.credit_transactions : []),
    debit_transactions: sorted.flatMap((c) => Array.isArray(c.debit_transactions) ? c.debit_transactions : []),
    document_page_count: Math.max(...sorted.map((c) => Number(c.document_page_count) || 0), sorted.length),
    chunk_page_start: 1,
    chunk_page_end: Math.max(...sorted.map((c) => Number(c.chunk_page_end) || 0), 1),
  };

  const scalarKeys: (keyof ExtractionChunkLike)[] = [
    'document_type','issuing_institution','issuing_country','detected_language','period_covered',
    'account_holder_name','account_holder_name_match','currency_code','usd_rate_estimate','ending_balance',
    'asset_type','asset_estimated_value_local','asset_ownership_confirmed',
  ];
  for (const key of scalarKeys) {
    const candidate = sorted.map((c) => c[key]).find(nonEmpty);
    if (candidate !== undefined) (merged as any)[key] = candidate;
  }

  merged.period_months = Math.max(...sorted.map((c) => Number(c.period_months) || 0), 0);
  merged.legibility_score = Math.min(...sorted.map((c) => Number(c.legibility_score) || 100), 100);
  merged.is_usable = sorted.every((c) => c.is_usable !== false);
  merged.authenticity_concerns = sorted.flatMap((c) => Array.isArray(c.authenticity_concerns) ? c.authenticity_concerns : []);
  merged.income_sources_detected = sorted.flatMap((c) => Array.isArray(c.income_sources_detected) ? c.income_sources_detected : []);
  merged.salary_deposits_detected = sorted.some((c) => c.salary_deposits_detected === true);
  merged.salary_deposit_count = sorted.reduce((sum, c) => sum + (Number(c.salary_deposit_count) || 0), 0);

  const controlParts = sorted.map((c) => c.statement_control_totals).filter(Boolean) as StatementControlTotals[];
  if (controlParts.length) {
    const pick = (flag: keyof StatementControlTotals, value: keyof StatementControlTotals) => {
      const part = controlParts.find((x: any) => x?.[flag] === true);
      return part ? Number((part as any)[value]) || 0 : 0;
    };
    const hasOpening = controlParts.some((x) => x.has_opening_balance === true);
    const hasClosing = controlParts.some((x) => x.has_closing_balance === true);
    const hasCredits = controlParts.some((x) => x.has_total_credits === true);
    const hasDebits = controlParts.some((x) => x.has_total_debits === true);
    merged.statement_control_totals = {
      available: hasOpening && hasClosing && hasCredits && hasDebits,
      has_opening_balance: hasOpening,
      has_closing_balance: hasClosing,
      has_total_credits: hasCredits,
      has_total_debits: hasDebits,
      opening_balance: pick('has_opening_balance', 'opening_balance'),
      closing_balance: pick('has_closing_balance', 'closing_balance'),
      total_credits: pick('has_total_credits', 'total_credits'),
      total_debits: pick('has_total_debits', 'total_debits'),
    };
  }

  return merged;
}

/**
 * C024 control-total reconciliation. If a statement provides control totals, the extracted
 * transaction transcript must reconcile to them. No controls => check is not applicable, not failed.
 */
export function reconcileStatementControlTotals(merged: ExtractionChunkLike): ControlReconciliationResult {
  const controls = merged?.statement_control_totals;
  const credits = (Array.isArray(merged?.credit_transactions) ? merged.credit_transactions : [])
    .reduce((s: number, t: any) => s + (Number(t?.amount) || 0), 0);
  const debits = (Array.isArray(merged?.debit_transactions) ? merged.debit_transactions : [])
    .reduce((s: number, t: any) => s + (Number(t?.amount) || 0), 0);

  if (!controls?.available) {
    return { applicable: false, complete: true, extractedCredits: credits, extractedDebits: debits, expectedCredits: 0, expectedDebits: 0, balanceDelta: 0, tolerance: 0 };
  }

  const expectedCredits = Number(controls.total_credits) || 0;
  const expectedDebits = Number(controls.total_debits) || 0;
  const opening = Number(controls.opening_balance) || 0;
  const closing = Number(controls.closing_balance) || 0;
  // Currency-native arithmetic. A few cents of OCR/rounding noise is tolerated, but not a missing row.
  const scale = Math.max(Math.abs(expectedCredits), Math.abs(expectedDebits), Math.abs(opening), Math.abs(closing), 1);
  const tolerance = Math.max(0.05, scale * 1e-7);
  const creditDelta = Math.abs(credits - expectedCredits);
  const debitDelta = Math.abs(debits - expectedDebits);
  const balanceDelta = Math.abs((opening + expectedCredits - expectedDebits) - closing);
  const complete = creditDelta <= tolerance && debitDelta <= tolerance && balanceDelta <= tolerance;

  return { applicable: true, complete, extractedCredits: credits, extractedDebits: debits, expectedCredits, expectedDebits, balanceDelta, tolerance };
}
