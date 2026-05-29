/**
 * POST /api/synthesize
 * Synthesis agent — schema lives server-side.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const MAX_RETRIES = 2;

const synthesisSchema = {
  type: Type.OBJECT,
  properties: {
    financial_identity_profile: {
      type: Type.OBJECT,
      properties: {
        profile_type:           { type: Type.STRING },
        overall_integrity_level:{ type: Type.STRING },
        trust_assessment:       { type: Type.STRING },
        professional_stability: { type: Type.STRING },
      },
      required: ['profile_type', 'overall_integrity_level', 'trust_assessment', 'professional_stability'],
    },
    aggregated_strengths:     { type: Type.ARRAY, items: { type: Type.STRING } },
    aggregated_risks:         { type: Type.ARRAY, items: { type: Type.STRING } },
    aggregated_uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
    cross_border_summary: {
      type: Type.OBJECT,
      properties: {
        migration_readiness:        { type: Type.NUMBER },
        economic_adaptability:      { type: Type.NUMBER },
        transferability_feasibility:{ type: Type.STRING },
      },
      required: ['migration_readiness', 'economic_adaptability', 'transferability_feasibility'],
    },
    behavioral_summary: {
      type: Type.OBJECT,
      properties: {
        interaction_stability_score: { type: Type.NUMBER },
        narrative_consistency:       { type: Type.STRING },
      },
      required: ['interaction_stability_score', 'narrative_consistency'],
    },
    evidence_summary: {
      type: Type.OBJECT,
      properties: {
        primary_evidence_sources: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence_gap_count:       { type: Type.NUMBER },
      },
      required: ['primary_evidence_sources', 'evidence_gap_count'],
    },
    score_explanation: {
      type: Type.OBJECT,
      properties: {
        top_positive_drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
        top_negative_drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['top_positive_drivers', 'top_negative_drivers'],
    },
    recommendation_summary: { type: Type.ARRAY, items: { type: Type.STRING } },
    overall_confidence:     { type: Type.NUMBER },
    analysis_integrity: {
      type: Type.OBJECT,
      properties: {
        evidence_quality:       { type: Type.NUMBER },
        reasoning_stability:    { type: Type.NUMBER },
        contradiction_severity: { type: Type.NUMBER },
        uncertainty_level:      { type: Type.NUMBER },
      },
      required: ['evidence_quality', 'reasoning_stability', 'contradiction_severity', 'uncertainty_level'],
    },
    dossier_markdown:  { type: Type.STRING },
    summary_statement: { type: Type.STRING },
  },
  required: [
    'financial_identity_profile', 'aggregated_strengths', 'aggregated_risks',
    'aggregated_uncertainties', 'cross_border_summary', 'behavioral_summary',
    'evidence_summary', 'score_explanation', 'recommendation_summary',
    'overall_confidence', 'analysis_integrity', 'dossier_markdown', 'summary_statement',
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { agentOutputs, documentSummary } = req.body;
  if (!agentOutputs) return res.status(400).json({ error: 'Missing agentOutputs' });

  const { id, fin, fraud, country, beh } = agentOutputs;
  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = attempt > 0
        ? `RETRY ${attempt}: Previous synthesis was malformed. Return STRICT JSON matching the schema. No markdown, no text outside JSON.`
        : `FINAL SYNTHESIS AGENT — PERSONA.CREDIT

Assemble the 5 specialist agent reports into a final cross-border financial dossier.

RULES:
- Use ONLY findings from the agent reports below. Do NOT invent new data.
- Distinguish clearly between document-verified figures and self-declared figures.
- Write summary_statement as 2-3 sentences a landlord or bank officer can read and understand.
- Write dossier_markdown as a structured professional report in plain English.
- overall_confidence: 0.0–1.0. Reflects evidence quality, not score level.
- Return STRICT JSON ONLY. No markdown code blocks.

DOCUMENT EXTRACTION SUMMARY:
${JSON.stringify(documentSummary || { note: 'No documents provided' })}

AGENT REPORTS:
1. Identity: ${JSON.stringify(id)}
2. Financial: ${JSON.stringify(fin)}
3. Fraud & Contradictions: ${JSON.stringify(fraud)}
4. Country & Transferability: ${JSON.stringify(country)}
5. Behavioral: ${JSON.stringify(beh)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: { parts: [{ text: prompt }] },
        config: { responseMimeType: 'application/json', responseSchema: synthesisSchema },
      });

      let jsonStr = (response.text || '{}').trim();
      if (jsonStr.includes('```')) {
        const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (m) jsonStr = m[1];
      }

      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || parsed === null) throw new Error('Non-object');

      return res.status(200).json(parsed);
    } catch (err) {
      console.error(`[synthesize] attempt ${attempt}:`, String(err));
      if (attempt === MAX_RETRIES) {
        return res.status(500).json({ error: 'Synthesis failed', detail: String(err) });
      }
    }
  }
}
