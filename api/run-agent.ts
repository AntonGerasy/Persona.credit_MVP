/**
 * POST /api/run-agent
 * Runs a single scoring agent server-side.
 * Schemas live here — never serialized from client.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const MAX_RETRIES = 2;

const GLOBAL_RULES = `
ANTI-HALLUCINATION RULES (MANDATORY):
- Base ALL assessments ONLY on data in the context object below.
- Do NOT invent names, numbers, employers, account numbers, or transaction details.
- If data is absent, reflect this in confidence score and missing_information array.
- Return STRICT JSON ONLY — no markdown, no explanation outside the JSON.
`;

// All schemas defined server-side with proper Type references
const AGENT_SCHEMAS: Record<string, any> = {
  Identity: {
    type: Type.OBJECT,
    properties: {
      identity_reliability:           { type: Type.NUMBER },
      document_coherence:             { type: Type.NUMBER },
      timeline_consistency:           { type: Type.NUMBER },
      risk_flags:                     { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence:                       { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:                     { type: Type.NUMBER },
      uncertainty_factors:            { type: Type.ARRAY, items: { type: Type.STRING } },
      missing_information:            { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:              { type: Type.NUMBER },
      name_consistency_across_docs:   { type: Type.STRING },
      documents_with_name_match:      { type: Type.NUMBER },
    },
    required: [
      'identity_reliability', 'document_coherence', 'timeline_consistency',
      'risk_flags', 'evidence', 'confidence', 'uncertainty_factors',
      'missing_information', 'evidence_strength',
      'name_consistency_across_docs', 'documents_with_name_match',
    ],
  },

  Financial: {
    type: Type.OBJECT,
    properties: {
      financial_stability:            { type: Type.NUMBER },
      income_reliability:             { type: Type.NUMBER },
      migration_resilience:           { type: Type.NUMBER },
      risk_factors:                   { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence:                       { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:                     { type: Type.NUMBER },
      uncertainty_factors:            { type: Type.ARRAY, items: { type: Type.STRING } },
      missing_information:            { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:              { type: Type.NUMBER },
      verified_monthly_income_local:  { type: Type.NUMBER },
      verified_currency:              { type: Type.STRING },
      verified_income_usd_estimate:   { type: Type.NUMBER },
      income_context_in_origin:       { type: Type.STRING },
      document_coverage_months:       { type: Type.NUMBER },
      documents_analysed:             { type: Type.NUMBER },
    },
    required: [
      'financial_stability', 'income_reliability', 'migration_resilience',
      'risk_factors', 'evidence', 'confidence', 'uncertainty_factors',
      'missing_information', 'evidence_strength',
      'verified_monthly_income_local', 'verified_currency',
      'verified_income_usd_estimate', 'income_context_in_origin',
      'document_coverage_months', 'documents_analysed',
    ],
  },

  Fraud: {
    type: Type.OBJECT,
    properties: {
      fraud_risk:           { type: Type.NUMBER },
      contradiction_score:  { type: Type.NUMBER },
      risk_patterns: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            pattern:   { type: Type.STRING },
            severity:  { type: Type.NUMBER },
            confidence:{ type: Type.NUMBER },
            evidence:  { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['pattern', 'severity', 'confidence', 'evidence'],
        },
      },
      contradictions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type:                { type: Type.STRING },
            description:         { type: Type.STRING },
            severity:            { type: Type.NUMBER },
            confidence:          { type: Type.NUMBER },
            supporting_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['type', 'description', 'severity', 'confidence', 'supporting_evidence'],
        },
      },
      confidence:           { type: Type.NUMBER },
      uncertainty_factors:  { type: Type.ARRAY, items: { type: Type.STRING } },
      missing_information:  { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:    { type: Type.NUMBER },
    },
    required: [
      'fraud_risk', 'contradiction_score', 'risk_patterns', 'contradictions',
      'confidence', 'uncertainty_factors', 'missing_information', 'evidence_strength',
    ],
  },

  Country: {
    type: Type.OBJECT,
    properties: {
      country_transferability:          { type: Type.NUMBER },
      destination_alignment:            { type: Type.NUMBER },
      migration_readiness:              { type: Type.NUMBER },
      economic_adaptability:            { type: Type.NUMBER },
      currency_risk:                    { type: Type.NUMBER },
      origin_income_percentile:         { type: Type.NUMBER },
      origin_income_context:            { type: Type.STRING },
      destination_income_equivalent_usd:{ type: Type.NUMBER },
      income_transfer_narrative:        { type: Type.STRING },
      sector_demand_in_destination:     { type: Type.STRING },
      risk_factors:                     { type: Type.ARRAY, items: { type: Type.STRING } },
      strengths:                        { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence:                         { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:                       { type: Type.NUMBER },
      uncertainty_factors:              { type: Type.ARRAY, items: { type: Type.STRING } },
      missing_information:              { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:                { type: Type.NUMBER },
    },
    required: [
      'country_transferability', 'destination_alignment', 'migration_readiness',
      'economic_adaptability', 'currency_risk',
      'origin_income_percentile', 'origin_income_context',
      'destination_income_equivalent_usd', 'income_transfer_narrative',
      'sector_demand_in_destination',
      'risk_factors', 'strengths', 'evidence', 'confidence',
      'uncertainty_factors', 'missing_information', 'evidence_strength',
    ],
  },

  Behavioral: {
    type: Type.OBJECT,
    properties: {
      behavioral_consistency: { type: Type.NUMBER },
      narrative_stability:    { type: Type.NUMBER },
      risk_signals:           { type: Type.ARRAY, items: { type: Type.STRING } },
      positive_signals:       { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence:               { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:             { type: Type.NUMBER },
      uncertainty_factors:    { type: Type.ARRAY, items: { type: Type.STRING } },
      missing_information:    { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:      { type: Type.NUMBER },
    },
    required: [
      'behavioral_consistency', 'narrative_stability',
      'risk_signals', 'positive_signals', 'evidence',
      'confidence', 'uncertainty_factors', 'missing_information', 'evidence_strength',
    ],
  },

  ProviderKYB: {
    type: Type.OBJECT,
    properties: {
      kybConfidence:      { type: Type.NUMBER },
      verificationStatus: { type: Type.STRING },
      summary:            { type: Type.STRING },
      riskLevel:          { type: Type.STRING },
      flags:              { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['kybConfidence', 'verificationStatus', 'summary', 'riskLevel', 'flags'],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { agentName, promptBase, context } = req.body;
  if (!agentName || !promptBase || !context) {
    return res.status(400).json({ error: 'Missing: agentName, promptBase, context' });
  }

  // Schema lives server-side — never trust client-provided schema
  const schema = AGENT_SCHEMAS[agentName];
  if (!schema) {
    return res.status(400).json({ error: `Unknown agent: ${agentName}` });
  }

  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = attempt === 0
        ? `${promptBase}\n${GLOBAL_RULES}\n\n--- DATA CONTEXT ---\n${JSON.stringify(context, null, 2)}`
        : `RETRY ${attempt}: Previous response was malformed. Return STRICT JSON matching the schema.\n\n${promptBase}\n${GLOBAL_RULES}\n\n--- DATA CONTEXT ---\n${JSON.stringify(context, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: { parts: [{ text: prompt }] },
        config: { responseMimeType: 'application/json', responseSchema: schema },
      });

      let jsonStr = (response.text || '{}').trim();
      if (jsonStr.includes('```')) {
        const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (m) jsonStr = m[1];
      }

      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || parsed === null) throw new Error('Non-object response');

      return res.status(200).json(parsed);
    } catch (err) {
      console.error(`[run-agent] ${agentName} attempt ${attempt}:`, String(err));
      if (attempt === MAX_RETRIES) {
        return res.status(200).json({
          _agent_error: true,
          _agent_name: agentName,
          confidence: 0.1,
          evidence_strength: 0,
          missing_information: [`${agentName} agent failed after retries`],
          uncertainty_factors: ['Agent error'],
        });
      }
    }
  }
}
