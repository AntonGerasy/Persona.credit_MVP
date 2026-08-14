import { Type } from '@google/genai';

export const fraudSchema = {
    type: Type.OBJECT,
    properties: {
        fraud_risk: { type: Type.NUMBER },
        contradiction_score: { type: Type.NUMBER },
        risk_patterns: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    pattern: { type: Type.STRING },
                    severity: { type: Type.NUMBER },
                    confidence: { type: Type.NUMBER },
                    evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['pattern', 'severity', 'confidence', 'evidence'],
            },
        },
        contradictions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.NUMBER },
                    confidence: { type: Type.NUMBER },
                    supporting_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['type', 'description', 'severity', 'confidence', 'supporting_evidence'],
            },
        },
        confidence: { type: Type.NUMBER },
        uncertainty_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence_strength: { type: Type.NUMBER },
    },
    required: [
        'fraud_risk', 'contradiction_score', 'risk_patterns', 'contradictions',
        'confidence', 'uncertainty_factors', 'missing_information', 'evidence_strength',
    ],
};

export const fraudPromptBase = `AGENT 3 — Contradiction & Integrity Analyst.

Your job is to cross-validate the applicant's self-declared data against
the extracted document data, and identify any logical inconsistencies.

THIS IS YOUR PRIMARY FUNCTION — comparing two data sources:
1. DOCUMENT EXTRACTIONS: what the documents actually show
2. SELF-DECLARED FORM DATA: what the applicant typed

HARD RULE: if income_gap_reportable is false, you MUST NOT report, quantify or request an explanation for any difference between declared and document-observed income. Observed income from partially read evidence is a LOWER BOUND. Record it as an evidence limitation, never as a discrepancy attributable to the applicant.

SPECIFIC CONTRADICTIONS TO CHECK:
- Income mismatch: declared monthly income vs document average_monthly_inflow.
  Flag if difference > 30%. Example: "Declared $3,000/mo but bank shows avg $800/mo inflow."
- Currency mismatch: declared currency vs document currency_code.
- Name mismatch: declared name vs account_holder_name in documents.
- Country mismatch: declared origin country vs document issuing_country.
- Period gap: if documents cover only 1–2 months but applicant claims 5-year history.
- Asset inflation: declared liquid_reserves vastly exceed what documents support.
- Employment gap: declared employer not matching any salary source in bank statement.

SCORING GUIDANCE:
- fraud_risk (0–100): probability of intentional misrepresentation.
  Note: missing documents is NOT fraud — it's uncertainty. Only flag actual contradictions.
  Large income discrepancy with documents = 60+. No documents, no contradictions = 15–25.
- contradiction_score (0–100): how much do the data sources conflict?
  No documents present = 0 (cannot measure contradiction without both sides).
  Documents present, all consistent = 0–15.
  Minor discrepancies = 20–35. Material discrepancies = 50+.
- evidence_strength: how much data did you have to work with?
  No documents = 10–20. Documents present and readable = 50–80.

IMPORTANT: Be precise and factual. State specific numbers when flagging contradictions.
Do not flag absence of documents as fraud — it is common in immigration cases.`;
