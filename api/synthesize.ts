/**
 * POST /api/synthesize
 * Vercel Hobby: 10s hard limit.
 * Returns ONLY summary_statement — 2-3 sentences for the lender.
 * Everything else is built client-side from agent outputs.
 */

export const maxDuration = 60; // Vercel Hobby supports up to 60s via module-level export

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAiSession } from './_lib/aiEndpointSecurity.js';
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
  if (!(await requireAiSession(req, res, 'synthesize', 20, 60))) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { fin, country, id, documentSummary, purpose, purpose_lens, reconciliation, ppp_context_only, geo } = req.body;
  if (!fin || !country) return res.status(400).json({ error: 'Missing required fields' });

  const ai = new GoogleGenAI({ apiKey });

  // Deterministic income reconciliation (source of truth) — overrides any agent claim.
  const rec = reconciliation || {};
  const incomeStatus: string = rec.income_status || 'unverified';
  const isContradicted = incomeStatus === 'contradicted';

  // Build tightly scoped context — only what matters for the summary
  const ctx = {
    name: id?.name_consistency_across_docs ? 'Applicant' : 'Applicant',
    origin: country?.origin_income_context || '',
    income_narrative: country?.income_transfer_narrative || '',
    income_verified: fin?.verified_monthly_income_local
      ? `${fin.verified_currency || ''} ${fin.verified_monthly_income_local}/month`
      : 'not document-verified',
    income_usd: fin?.verified_income_usd_estimate || 0,
    // Reconciliation = the deterministic truth the rest of the system already shows.
    income_status: incomeStatus,
    documented_monthly_usd: rec.verified_monthly_usd ?? null,
    declared_monthly_usd: rec.declared_monthly_usd ?? null,
    income_discrepancy_pct: rec.discrepancy_pct ?? null,
    reconciliation_explanation: rec.explanation || '',
    sector_demand: country?.sector_demand_in_destination || '',
    doc_count: documentSummary?.usable_documents || 0,
    fin_stability: fin?.financial_stability || 50,
    id_reliability: id?.identity_reliability || 50,
    applying_for: purpose || 'Financial Verification',
    product_lens: purpose_lens || 'General cross-border financial picture.',
  };

  const contradictionRule = isContradicted
    ? `
CRITICAL — INCOME IS CONTRADICTED: documents (~$${ctx.documented_monthly_usd}/mo) do NOT support the declared figure (~$${ctx.declared_monthly_usd}/mo, ${ctx.income_discrepancy_pct}% gap).
- Do NOT list income, earnings, or the declared figure as a strength. Never use the word "verified" about income.
- top_risks MUST lead with this contradiction as the #1 risk, in plain terms.
- The summary_statement must state plainly that declared income is unverified and contradicted by the documents.`
    : `
- Income status is "${ctx.income_status}". Only call income a strength if it is document-verified (status "verified" or "partial"); otherwise treat it as a declared/unverified claim, not a strength.`;

  const geoRule = geo?.already_in_destination
    ? `\nGEOGRAPHY: the applicant ALREADY lives in ${geo.destination_country} (${(geo.signals || []).join('; ')}). Do NOT recommend "relocate", "secure a destination job", or "establish a destination identity". Frame strengths/risks/summary for someone already resident (e.g. building local credit history, formalizing local income).`
    : '';

  const prompt = `Write a 2-3 sentence financial verification summary for the recipient of this dossier.
The applicant is applying for: ${ctx.applying_for}.
Underwriting lens for this product: ${ctx.product_lens}
Facts: ${JSON.stringify(ctx)}
Rules:
- Tailor the summary, strengths, and risks to what THIS product's decision-maker evaluates — not a generic verification.
- Be specific. Use actual numbers — and for income use the DOCUMENTED figure (documented_monthly_usd), never the declared claim.
- PROFESSION RULE (STRICT): mention a profession/sector ONLY if it is explicitly present in Facts. If absent, describe the applicant without a profession — NEVER guess one from payer names, country, or income level.
- summary_statement: plain English, for the specific recipient (e.g. landlord for a rental, bank officer for a mortgage). No jargon.
- top_strengths: 3 short bullet facts relevant to this product (e.g. "Income covers typical rent ~3x" for a rental).
- top_risks: 2 short bullet facts relevant to this product (e.g. "No 2-year income history for mortgage underwriting").${contradictionRule}${ppp_context_only ? `
- PPP / purchasing-power / "equivalent" figures are ORIGIN CONTEXT ONLY. Do NOT list them as a strength and do NOT headline them: the recipient collects in USD, so the relevant number is the documented USD income, not a PPP-inflated one.` : ''}${geoRule}
- Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 500,
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
