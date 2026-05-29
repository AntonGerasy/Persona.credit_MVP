import { Type } from '@google/genai';

export const identitySchema = {
    type: Type.OBJECT,
    properties: {
        identity_reliability: { type: Type.NUMBER },
        document_coherence: { type: Type.NUMBER },
        timeline_consistency: { type: Type.NUMBER },
        risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        confidence: { type: Type.NUMBER },
        uncertainty_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence_strength: { type: Type.NUMBER },
        name_consistency_across_docs: { type: Type.STRING },
        documents_with_name_match: { type: Type.NUMBER },
    },
    required: [
        'identity_reliability', 'document_coherence', 'timeline_consistency',
        'risk_flags', 'evidence', 'confidence', 'uncertainty_factors',
        'missing_information', 'evidence_strength',
        'name_consistency_across_docs', 'documents_with_name_match',
    ],
};

export const identityPromptBase = `AGENT 1 — Identity Analyst.

Your job is to evaluate the structural integrity of the applicant's identity claims
using document extractions as your primary evidence.

CRITICAL: You have two data sources. Use them in this priority order:
1. DOCUMENT EXTRACTIONS (primary) — extracted names, institution data, account holders.
   Cross-reference the name on each document against the declared applicant name.
2. SELF-DECLARED FORM DATA (secondary) — name, date of birth, citizenship.
   These are unverified without document support.

SCORING GUIDANCE (0–100 scale):
- identity_reliability: How confident are we this person is who they say they are?
  Each document where account_holder_name_match = "Match" is strong positive evidence.
  "Partial match" (e.g. middle name absent) = minor flag, not disqualifying.
  "No match" on any document = significant risk flag.
- document_coherence: Do the documents form a consistent picture of one person?
  Same name across multiple documents, consistent institution country vs declared origin = high.
  Conflicting names or institution country vs declared country = low.
- timeline_consistency: Do document dates align with the applicant's stated history?
  Employment tenure claim vs payslip dates, property deed date vs years in country, etc.
- evidence_strength: 0–100.
  No documents at all = max 20 (identity rests entirely on self-declaration).
  1 document with name match = 45–60.
  2+ documents with consistent name = 70–85.

IMPORTANT:
- name_consistency_across_docs: "Consistent" / "Minor variation" / "Inconsistent" / "Single document only" / "No documents"
- documents_with_name_match: count of documents where name matched or partially matched
- Do NOT comment on financial health or fraud patterns.
- Note in missing_information if no government ID or passport was provided — this is
  a standard gap in immigration financial profiles and should be flagged but not penalised heavily.`;
