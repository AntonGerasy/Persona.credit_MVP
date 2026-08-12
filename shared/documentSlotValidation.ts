export type DocumentCategory =
  | 'identity'
  | 'bank_statement'
  | 'payslip'
  | 'tax_document'
  | 'asset_document'
  | 'investment_statement'
  | 'other_financial'
  | 'unknown';

export interface DocumentSlotSignals {
  documentCategory?: string;
  identityDocumentStructure?: boolean;
  issuingAuthorityPresent?: boolean;
  holderIdentityPresent?: boolean;
  transactionActivityPresent?: boolean;
  accountStatementStructurePresent?: boolean;
  financialAccountPresent?: boolean;
}

export interface SlotCompatibilityResult {
  decision: 'accept' | 'reject' | 'review';
  reason: string;
}

const normalizeCategory = (value?: string): DocumentCategory => {
  const v = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (/^(identity)$|passport|national_id|identity_card|driver|driving|residence_permit|government_id|identity_document/.test(v)) return 'identity';
  if (/bank.*statement|account_statement|checking_statement|savings_statement/.test(v)) return 'bank_statement';
  if (/pay.*slip|salary_statement|payroll_statement/.test(v)) return 'payslip';
  if (/tax/.test(v)) return 'tax_document';
  if (/property|deed|vehicle_title|asset/.test(v)) return 'asset_document';
  if (/investment|brokerage|portfolio/.test(v)) return 'investment_statement';
  if (/financial/.test(v)) return 'other_financial';
  return 'unknown';
};

/**
 * Universal cross-slot guard. No person, country, bank, currency, filename,
 * or single keyword can make an upload compatible with the Identity slot.
 * The decision uses a combination of document-category + structural signals.
 */
export function evaluateIdentitySlotCompatibility(signals: DocumentSlotSignals): SlotCompatibilityResult {
  const category = normalizeCategory(signals.documentCategory);
  const identitySignals = [
    category === 'identity',
    signals.identityDocumentStructure === true,
    signals.issuingAuthorityPresent === true,
    signals.holderIdentityPresent === true,
  ].filter(Boolean).length;

  const strongFinancialSignals = [
    category !== 'identity' && category !== 'unknown',
    signals.transactionActivityPresent === true,
    signals.accountStatementStructurePresent === true,
    signals.financialAccountPresent === true,
  ].filter(Boolean).length;

  // Strong financial structure with weak identity structure is a hard slot mismatch.
  if (strongFinancialSignals >= 2 && identitySignals < 3) {
    return {
      decision: 'reject',
      reason: 'Wrong document type — this appears to be a financial document, not a government-issued identity document. Upload a passport, national identity card, residence permit, or driver license.',
    };
  }

  // A confidently identified non-identity category is also a hard mismatch.
  if (category !== 'identity' && category !== 'unknown' && identitySignals < 3) {
    return {
      decision: 'reject',
      reason: 'Wrong document type — this file is not an accepted identity document. Upload a passport, national identity card, residence permit, or driver license.',
    };
  }

  // Accept only when multiple independent identity signals agree.
  if (category === 'identity' && identitySignals >= 3 && strongFinancialSignals <= 1) {
    return {
      decision: 'accept',
      reason: 'Identity document type confirmed for this upload field.',
    };
  }

  // Unknown/conflicting extraction never becomes a green success.
  return {
    decision: 'review',
    reason: 'Identity document type could not be confirmed automatically. Please upload a clear passport, national identity card, residence permit, or driver license.',
  };
}


export interface IdentityValidationModelResult extends DocumentSlotSignals {
  isValid?: boolean;
  reason?: string;
}

export interface IdentityValidationDecision {
  decision: 'accept' | 'reject' | 'review';
  isValid: boolean;
  reviewRequired: boolean;
  slotCompatibility: 'accept' | 'reject' | 'review';
  reason: string;
}

/**
 * C012 composition guard: slot compatibility and document validity are separate
 * requirements. A structurally correct identity document can only be accepted
 * when BOTH the deterministic slot guard accepts it AND the validity analysis
 * did not reject it as expired, illegible, tampered, synthetic/specimen, or
 * otherwise invalid.
 */
export function resolveIdentityValidation(result: IdentityValidationModelResult): IdentityValidationDecision {
  const slot = evaluateIdentitySlotCompatibility(result);
  const modelRejected = result.isValid !== true;
  const decision: 'accept' | 'reject' | 'review' =
    slot.decision === 'reject' ? 'reject' :
    modelRejected ? 'review' :
    slot.decision;

  return {
    decision,
    isValid: decision === 'accept',
    reviewRequired: decision === 'review',
    slotCompatibility: slot.decision,
    reason: decision === 'accept'
      ? slot.reason
      : slot.decision === 'reject'
        ? slot.reason
        : 'This identity document could not be fully validated automatically. Please upload a clear, current, unaltered government-issued identity document that belongs to the applicant.',
  };
}
