/**
 * POST /api/synthesize
 * Vercel Hobby — 60s limit via export const maxDuration.
 * Returns summary_statement + top_strengths + top_risks.
 */
export const maxDuration = 60; // Vercel Hobby supports up to 60s via module export

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const schema = {
  type: Type.OBJECT,
  properties: {
    summary_statement: { type: Type.STRING },
    top_strengths:     { type: Type.ARRAY, items: { type: Type.STRING } },
    top_risks:         { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['summary_statement', 'top_strengths', 'top_risks'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { fin, country, id, documentSummary } = req.body;
  if (!fin || !country) return res.status(400).json({ error: 'Missing required fields' });

  const ai = new GoogleGenAI({ apiKey });

  // Build tightly scoped context — only what matters for the summary
  const ctx = {
    name: id?.name_consistency_across_docs ? 'Applicant' : 'Applicant',
    origin: country?.origin_income_context || '',
    income_narrative: country?.income_transfer_narrative || '',
    income_verified: fin?.verified_monthly_income_local
      ? `${fin.verified_currency || ''} ${fin.verified_monthly_income_local}/month`
      : 'not document-verified',
    income_usd: fin?.verified_income_usd_estimate || 0,
    sector_demand: country?.sector_demand_in_destination || '',
    doc_count: documentSummary?.usable_documents || 0,
    fin_stability: fin?.financial_stability || 50,
    id_reliability: id?.identity_reliability || 50,
  };

  const prompt = `Write a 2-3 sentence financial verification summary for a lender.
Facts: ${JSON.stringify(ctx)}
Rules:
- Be specific. Use actual numbers.
- summary_statement: plain English, for a landlord or bank officer. No jargon.
- top_strengths: 3 short bullet facts (e.g. "Regular salary deposits confirmed for 3 months")
- top_risks: 2 short bullet facts (e.g. "Bank of America statement is from 2022")
- Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 600,
      },
    });

    let jsonStr = (response.text || '{}').trim();
    if (jsonStr.includes('```')) {
      const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) jsonStr = m[1];
    }
    return res.status(200).json(JSON.parse(jsonStr));

  } catch (err) {
    console.error('[synthesize]', String(err));
    return res.status(500).json({ error: 'Synthesis failed' });
  }
}
