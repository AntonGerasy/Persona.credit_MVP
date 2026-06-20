/**
 * POST /api/run-agent
 *
 * Designed for Vercel Hobby (10s hard limit).
 * - thinkingBudget: 0  (no reasoning chain)
 * - maxOutputTokens: 400 (strict cap)
 * - No retries — fail fast, client handles fallback
 * - Schemas and ultra-short prompts live here
 */

export const maxDuration = 60; // Vercel Hobby supports up to 60s via module-level export

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// ── Minimal schemas — only essential fields ──────────────────────────────────

const SCHEMAS: Record<string, any> = {
  Identity: {
    type: Type.OBJECT,
    properties: {
      identity_reliability:        { type: Type.NUMBER },
      document_coherence:          { type: Type.NUMBER },
      timeline_consistency:        { type: Type.NUMBER },
      risk_flags:                  { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence:                    { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:                  { type: Type.NUMBER },
      missing_information:         { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:           { type: Type.NUMBER },
      name_consistency_across_docs:{ type: Type.STRING },
      documents_with_name_match:   { type: Type.NUMBER },
    },
    required: ['identity_reliability','document_coherence','timeline_consistency',
      'risk_flags','evidence','confidence','missing_information','evidence_strength',
      'name_consistency_across_docs','documents_with_name_match'],
  },

  Financial: {
    type: Type.OBJECT,
    properties: {
      financial_stability:           { type: Type.NUMBER },
      income_reliability:            { type: Type.NUMBER },
      migration_resilience:          { type: Type.NUMBER },
      risk_factors:                  { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence:                      { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:                    { type: Type.NUMBER },
      missing_information:           { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:             { type: Type.NUMBER },
      verified_monthly_income_local: { type: Type.NUMBER },
      verified_currency:             { type: Type.STRING },
      verified_income_usd_estimate:  { type: Type.NUMBER },
      income_context_in_origin:      { type: Type.STRING },
      document_coverage_months:      { type: Type.NUMBER },
      documents_analysed:            { type: Type.NUMBER },
    },
    required: ['financial_stability','income_reliability','migration_resilience',
      'risk_factors','evidence','confidence','missing_information','evidence_strength',
      'verified_monthly_income_local','verified_currency','verified_income_usd_estimate',
      'income_context_in_origin','document_coverage_months','documents_analysed'],
  },

  Fraud: {
    type: Type.OBJECT,
    properties: {
      fraud_risk:          { type: Type.NUMBER },
      contradiction_score: { type: Type.NUMBER },
      risk_patterns:       { type: Type.ARRAY, items: { type: Type.STRING } },
      contradictions:      { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:          { type: Type.NUMBER },
      missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:   { type: Type.NUMBER },
    },
    required: ['fraud_risk','contradiction_score','risk_patterns','contradictions',
      'confidence','missing_information','evidence_strength'],
  },

  Country: {
    type: Type.OBJECT,
    properties: {
      country_transferability:           { type: Type.NUMBER },
      destination_alignment:             { type: Type.NUMBER },
      migration_readiness:               { type: Type.NUMBER },
      economic_adaptability:             { type: Type.NUMBER },
      currency_risk:                     { type: Type.NUMBER },
      origin_income_percentile:          { type: Type.NUMBER },
      origin_income_context:             { type: Type.STRING },
      destination_income_equivalent_usd: { type: Type.NUMBER },
      income_transfer_narrative:         { type: Type.STRING },
      sector_demand_in_destination:      { type: Type.STRING },
      raw_data_table: {
        type: Type.OBJECT,
        properties: {
          monthly_income_original:   { type: Type.STRING },
          monthly_income_usd:        { type: Type.STRING },
          income_vs_national_median: { type: Type.STRING },
          income_vs_sector_median:   { type: Type.STRING },
          income_percentile_label:   { type: Type.STRING },
          ppp_equivalent_usd:        { type: Type.STRING },
          sector_benchmark_note:     { type: Type.STRING },
          document_institution:      { type: Type.STRING },
          document_period:           { type: Type.STRING },
          income_pattern:            { type: Type.STRING },
        },
        required: ['monthly_income_original','monthly_income_usd',
          'income_vs_national_median','income_vs_sector_median',
          'income_percentile_label','ppp_equivalent_usd',
          'sector_benchmark_note','document_institution',
          'document_period','income_pattern'],
      },
      risk_factors:        { type: Type.ARRAY, items: { type: Type.STRING } },
      strengths:           { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:          { type: Type.NUMBER },
      missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:   { type: Type.NUMBER },
    },
    required: ['country_transferability','destination_alignment','migration_readiness',
      'economic_adaptability','currency_risk','origin_income_percentile',
      'origin_income_context','destination_income_equivalent_usd',
      'income_transfer_narrative','sector_demand_in_destination',
      'raw_data_table',
      'risk_factors','strengths','confidence','missing_information','evidence_strength'],
  },

  Behavioral: {
    type: Type.OBJECT,
    properties: {
      behavioral_consistency: { type: Type.NUMBER },
      narrative_stability:    { type: Type.NUMBER },
      risk_signals:           { type: Type.ARRAY, items: { type: Type.STRING } },
      positive_signals:       { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence:             { type: Type.NUMBER },
      missing_information:    { type: Type.ARRAY, items: { type: Type.STRING } },
      evidence_strength:      { type: Type.NUMBER },
    },
    required: ['behavioral_consistency','narrative_stability','risk_signals',
      'positive_signals','confidence','missing_information','evidence_strength'],
  },

  Culture: {
    type: Type.OBJECT,
    properties: {
      financial_culture_context:  { type: Type.STRING },
      cultural_asset_notes:       { type: Type.ARRAY, items: { type: Type.STRING } },
      cash_economy_note:          { type: Type.STRING },
      debt_culture_note:          { type: Type.STRING },
      lender_cultural_guidance:   { type: Type.STRING },
      confidence:                 { type: Type.NUMBER },
      evidence_strength:          { type: Type.NUMBER },
    },
    required: ['financial_culture_context','cultural_asset_notes','cash_economy_note',
      'debt_culture_note','lender_cultural_guidance','confidence','evidence_strength'],
  },
};

// ── Ultra-short prompts — designed to complete in < 8s ──────────────────────

const PROMPTS: Record<string, (ctx: any) => string> = {
  Identity: (ctx) => `Identity analyst. Score 0-100. Use ONLY the data below.
Data: ${JSON.stringify(ctx)}
Rules: numbers are 0-100. evidence_strength=0 if no docs. Return JSON only.`,

  Financial: (ctx) => `Financial analyst. Score 0-100. Use ONLY data below.
If documents extracted: use verified figures. If not: use declared figures with low confidence.
income_context_in_origin: 1 sentence explaining what the income means in origin country (e.g. "UAH 82,000/mo = top 15% in Ukraine, IT sector").
income_transfer_narrative: 1 sentence for lender (e.g. "IT background → $80-120k/yr US potential").
Data: ${JSON.stringify(ctx)}
Rules: numbers are 0-100 except income figures. Return JSON only.`,

  Fraud: (ctx) => `Fraud analyst. Compare declared data vs document extractions.
Flag contradictions only if supported by data. Missing docs ≠ fraud.
Data: ${JSON.stringify(ctx)}
Rules: fraud_risk and contradiction_score are 0-100. Return JSON only.`,

  Country: (ctx) => `Country Intelligence & Lender Translation Analyst.
You are a financial interpreter for US/UK/CA lenders reading foreign financial documents.

FILL raw_data_table FIRST with specific numbers:
- monthly_income_original: exact amount + currency (e.g. "UAH 42,000/month")
- monthly_income_usd: use currency_usd_rate_approx (e.g. "≈ $1,012 USD/month")  
- income_vs_national_median: % above/below median (e.g. "110% above Ukraine median of UAH 20,000/mo")
- income_vs_sector_median: % vs sector benchmark (e.g. "47% below IT sector median of UAH 80,000/mo")
- income_percentile_label: (e.g. "Top 22% of earners in Ukraine")
- ppp_equivalent_usd: purchasing power equivalent (e.g. "≈ $5,600 USD/month US purchasing power")
- sector_benchmark_note: US salary range for this profession (e.g. "IT engineers from Ukraine earn $65k-130k/yr in US")
- document_institution: bank name from documents
- document_period: statement period
- income_pattern: regularity (e.g. "Regular — 3 monthly salary deposits confirmed")

THEN write:
- origin_income_context: 2-3 sentences. What does this income mean IN the origin country? Reference sector.
- income_transfer_narrative: 2-3 sentences FOR THE LENDER. Can this person pay rent/loan in destination?

Data: ${JSON.stringify(ctx)}
Rules: all scores 0-100. Use actual numbers from country intelligence. Return JSON only.`,

  Behavioral: (ctx) => `Behavioral analyst. Assess consistency of profile data.
Data: ${JSON.stringify(ctx)}
Rules: scores 0-100. Return JSON only.`,

  Culture: (ctx) => `Financial Culture Analyst for US/UK/CA lenders.
Your job: explain the applicant's origin-country FINANCIAL CULTURE so a Western lender does not misread normal local behaviour as risk.
Use the financial_culture block inside origin_intelligence if present.

Key principle: in many countries, behaviour that looks "risky" to a US underwriter is actually normal and conservative:
- Heavy cash use (informal economies) is normal, NOT hidden income
- No stock portfolio / no 401k is normal where investment culture differs
- No credit history / no debt is often PRUDENCE, not a thin-file risk
- Wealth held in property, gold, livestock, or foreign-currency cash is legitimate net worth invisible to credit checks
- Family-pooled finances and remittances are normal money flows

Produce:
- financial_culture_context: 2-3 sentences on how money is managed in this country (savings, investment norms).
- cultural_asset_notes: array of 2-4 short notes on locally-normal assets/behaviours a lender might otherwise misjudge.
- cash_economy_note: 1 sentence on whether cash-heavy behaviour is normal here.
- debt_culture_note: 1 sentence on how to read the applicant's debt/credit profile in cultural context.
- lender_cultural_guidance: 1-2 sentences directly advising the lender how to fairly interpret this applicant.

Data: ${JSON.stringify(ctx)}
Rules: factual, specific to the country. If no culture data available, give best general guidance and set evidence_strength low. Return JSON only.`,
};

// ── Safe fallback values ─────────────────────────────────────────────────────

const FALLBACKS: Record<string, any> = {
  Identity:  { identity_reliability:50, document_coherence:50, timeline_consistency:50, risk_flags:[], evidence:[], confidence:0.3, missing_information:['Agent timeout'], evidence_strength:10, name_consistency_across_docs:'Cannot determine', documents_with_name_match:0 },
  Financial: { financial_stability:50, income_reliability:50, migration_resilience:50, risk_factors:[], evidence:[], confidence:0.3, missing_information:['Agent timeout'], evidence_strength:10, verified_monthly_income_local:0, verified_currency:'', verified_income_usd_estimate:0, income_context_in_origin:'Unable to assess — agent timed out.', document_coverage_months:0, documents_analysed:0 },
  Fraud:     { fraud_risk:20, contradiction_score:0, risk_patterns:[], contradictions:[], confidence:0.3, missing_information:['Agent timeout'], evidence_strength:10 },
  Country:   { country_transferability:50, destination_alignment:50, migration_readiness:50, economic_adaptability:50, currency_risk:50, origin_income_percentile:50, origin_income_context:'Unable to assess.', destination_income_equivalent_usd:0, income_transfer_narrative:'Unable to assess.', sector_demand_in_destination:'Unknown', risk_factors:[], strengths:[], confidence:0.3, missing_information:['Agent timeout'], evidence_strength:10 },
  Behavioral:{ behavioral_consistency:50, narrative_stability:50, risk_signals:[], positive_signals:[], confidence:0.3, missing_information:['Agent timeout'], evidence_strength:10 },
  Culture:{ financial_culture_context:'Cultural financial context could not be assessed.', cultural_asset_notes:[], cash_economy_note:'', debt_culture_note:'', lender_cultural_guidance:'', confidence:0.3, evidence_strength:10 },
};

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { agentName, context } = req.body;
  if (!agentName || !context) return res.status(400).json({ error: 'Missing agentName or context' });

  const schema = SCHEMAS[agentName];
  const promptFn = PROMPTS[agentName];
  const fallback = FALLBACKS[agentName];

  if (!schema || !promptFn) return res.status(400).json({ error: `Unknown agent: ${agentName}` });

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: promptFn(context) }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 1024,
      },
    });

    let jsonStr = (response.text || '{}').trim();
    if (jsonStr.includes('```')) {
      const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) jsonStr = m[1];
    }

    const parsed = JSON.parse(jsonStr);
    return res.status(200).json(parsed);

  } catch (err) {
    const errMsg = String(err);
    console.error(`[run-agent:${agentName}]`, errMsg);
    // Return fallback — never crash the pipeline.
    // Include the real error reason so we can diagnose (timeout vs API key vs model vs quota).
    return res.status(200).json({ ...fallback, _agent_failed: true, _error_reason: errMsg.slice(0, 200) });
  }
}
