import { Type } from '@google/genai';

export const financialSchema = {
    type: Type.OBJECT,
    properties: {
        financial_stability: { type: Type.NUMBER },
        income_reliability: { type: Type.NUMBER },
        migration_resilience: { type: Type.NUMBER },
        risk_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        confidence: { type: Type.NUMBER },
        uncertainty_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence_strength: { type: Type.NUMBER },
        // New: document-derived fields passed to synthesis and lender report
        verified_monthly_income_local: { type: Type.NUMBER },
        verified_currency: { type: Type.STRING },
        verified_income_usd_estimate: { type: Type.NUMBER },
        income_context_in_origin: { type: Type.STRING },
        document_coverage_months: { type: Type.NUMBER },
        documents_analysed: { type: Type.NUMBER },
    },
    required: [
        'financial_stability', 'income_reliability', 'migration_resilience',
        'risk_factors', 'evidence', 'confidence', 'uncertainty_factors',
        'missing_information', 'evidence_strength',
        'verified_monthly_income_local', 'verified_currency',
        'verified_income_usd_estimate', 'income_context_in_origin',
        'document_coverage_months', 'documents_analysed',
    ],
};

export const financialPromptBase = `AGENT 2 — Financial Stability Analyst.

Your job is to evaluate the applicant's economic resilience and income reliability
for a cross-border financial transition.

CRITICAL: You have two data sources. Use them in this priority order:
1. DOCUMENT EXTRACTIONS (primary) — extracted data from actual uploaded documents.
   These are verified facts. Trust them over self-declared figures.
2. SELF-DECLARED FORM DATA (secondary) — figures the applicant typed manually.
   Use only to fill gaps where documents are absent.

SCORING GUIDANCE (0–100 scale):
- financial_stability: Overall picture of financial health. Weight document evidence
  heavily. A 6-month bank statement with regular salary = high stability signal.
- income_reliability: How consistent and verifiable is the income?
  Regular salary deposits confirmed by documents = 70–90.
  Irregular or document-absent = 30–50.
- migration_resilience: Can this person sustain themselves during transition?
  Consider: liquid reserves months of coverage, debt obligations, asset ownership.
- evidence_strength: 0–100. How much of your analysis rests on actual documents
  vs self-declared data? No documents = max 35. 1 document = 50–65. 3+ months
  of bank statements = 75+.

INCOME CONTEXTUALISATION (important):
The applicant's income is in a foreign currency from their origin country.
You MUST contextualise it:
- verified_income_usd_estimate: use the country intelligence data to estimate USD equivalent.
  Use approximate exchange rates based on your knowledge of the origin country economy.
- income_context_in_origin: explain what this income means in origin country context.
  Example: "UAH 82,000/month is approximately top 20% of earners in Ukraine in the
  tech sector as of 2025. Comparable to a senior developer or mid-level manager."
  Be specific about the income tier — this is what lenders need to understand.

RULES:
- Do NOT comment on identity verification or fraud patterns (other agents handle that).
- If documents are absent, set evidence_strength ≤ 35 and note it in missing_information.
- Do not invent figures not present in either data source.`;
