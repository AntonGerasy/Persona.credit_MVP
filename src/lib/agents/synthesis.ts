import { Type } from '@google/genai';

export const synthesisSchema = {
    type: Type.OBJECT,
    properties: {
        financial_identity_profile: {
            type: Type.OBJECT,
            properties: {
                profile_type: { type: Type.STRING },
                overall_integrity_level: { type: Type.STRING },
                trust_assessment: { type: Type.STRING },
                professional_stability: { type: Type.STRING }
            },
            required: ["profile_type", "overall_integrity_level", "trust_assessment", "professional_stability"]
        },
        aggregated_strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        aggregated_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        aggregated_uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
        cross_border_summary: {
            type: Type.OBJECT,
            properties: {
                migration_readiness: { type: Type.NUMBER },
                economic_adaptability: { type: Type.NUMBER },
                transferability_feasibility: { type: Type.STRING }
            },
            required: ["migration_readiness", "economic_adaptability", "transferability_feasibility"]
        },
        behavioral_summary: {
            type: Type.OBJECT,
            properties: {
                interaction_stability_score: { type: Type.NUMBER },
                narrative_consistency: { type: Type.STRING }
            },
            required: ["interaction_stability_score", "narrative_consistency"]
        },
        evidence_summary: {
            type: Type.OBJECT,
            properties: {
                primary_evidence_sources: { type: Type.ARRAY, items: { type: Type.STRING } },
                evidence_gap_count: { type: Type.NUMBER }
            },
            required: ["primary_evidence_sources", "evidence_gap_count"]
        },
        score_explanation: {
            type: Type.OBJECT,
            properties: {
                top_positive_drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
                top_negative_drivers: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["top_positive_drivers", "top_negative_drivers"]
        },
        recommendation_summary: { type: Type.ARRAY, items: { type: Type.STRING } },
        overall_confidence: { type: Type.NUMBER },
        analysis_integrity: {
            type: Type.OBJECT,
            properties: {
                evidence_quality: { type: Type.NUMBER },
                reasoning_stability: { type: Type.NUMBER },
                contradiction_severity: { type: Type.NUMBER },
                uncertainty_level: { type: Type.NUMBER }
            },
            required: ["evidence_quality", "reasoning_stability", "contradiction_severity", "uncertainty_level"]
        },
        dossier_markdown: { type: Type.STRING },
        summary_statement: { type: Type.STRING }
    },
    required: [
        "financial_identity_profile", "aggregated_strengths", "aggregated_risks", 
        "aggregated_uncertainties", "cross_border_summary", "behavioral_summary", 
        "evidence_summary", "score_explanation", "recommendation_summary", 
        "overall_confidence", "analysis_integrity", "dossier_markdown", "summary_statement"
    ]
};

export const getSynthesisPrompt = (id: any, fin: any, fraud: any, country: any, beh: any, isRetry: boolean, globalRules: string, documentSummary?: any) => {
    if (!isRetry) {
        return `FINAL SYNTHESIS AGENT — AGGREGATION ENGINE ONLY.
Assemble specialized analyst reports into a final Institutional Dossier.

STRICT CONSTRAINTS:
- DO NOT invent new evidence, risks, or contradictions.
- Use ONLY findings from the provided analyst outputs.
- Group related observations and identify consensus or divergence.
- Use analytical, institutional language. Avoid drama or speculation.
- When referencing income or financial figures, use document-verified amounts where available.
  Clearly distinguish verified (document) vs declared (self-reported) figures.

**DOCUMENT EXTRACTION SUMMARY (raw evidence baseline):**
${JSON.stringify(documentSummary || { note: 'No documents provided' })}

**AGENT REPORTS:**
1. Identity Analyst: ${JSON.stringify(id)}
2. Financial Stability Analyst: ${JSON.stringify(fin)}
3. Fraud & Contradiction Analyst: ${JSON.stringify(fraud)}
4. Country Transferability Analyst: ${JSON.stringify(country)}
5. Behavioral Consistency Analyst: ${JSON.stringify(beh)}

\n${globalRules}`;
    } else {
        return `STRICT RETRY REQUEST: Your previous synthesis was malformed or missing required aggregation fields.

Assemble the analyst reports into a structured Dossier.
STRICTLY aggregate findings without inventing new claims.

CRITICAL: You MUST output STRICT JSON ONLY. No markdown code blocks. No explanations.
\n${globalRules}`;
    }
};
