/**
 * POST /api/run-agent
 *
 * Designed for Vercel Hobby (10s hard limit).
 * - thinkingBudget: 0  (no reasoning chain)
 * - maxOutputTokens: 2048 (cap; raised from 1024 in v34.11 — Country agent truncation)
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
${ctx.geo?.already_in_destination ? `
GEOGRAPHY — THE APPLICANT ALREADY LIVES IN THE DESTINATION (${ctx.geo.destination_country}). Evidence: ${(ctx.geo.signals || []).join('; ')}.
- Do NOT frame this as someone "planning to relocate" or who "must secure a destination job / establish a destination identity." They are already resident.
- migration_readiness here means how ESTABLISHED they already are locally (documents, address, time in country), NOT willingness/ability to move.
- income_transfer_narrative must speak to an applicant who is already on the ground: reconcile their origin financial history with their existing local footprint. Recommendations must fit a resident, not a newcomer.` : `
GEOGRAPHY: No strong evidence the applicant already resides in the destination — treat origin financial history as the primary basis and frame destination fit prospectively.`}

INCOME FIGURE — DOCUMENTED REALITY IS THE SOURCE OF TRUTH (never confuse monthly vs annual):
- applicant_financials.has_documented_income tells you whether any income is backed by documents.
- If TRUE: applicant_financials.documented_monthly_income_usd is the REAL, verified MONTHLY income in USD, already normalized from the documents. ANCHOR every income number and the whole narrative on THIS figure. applicant_financials.documented_monthly_income_local (in documented_currency) is the same figure in the origin currency.
- The declared_*_UNVERIFIED fields are the applicant's OWN CLAIM and are NOT verified. NEVER present a declared figure as the income. If a declared figure differs from the documented one, say plainly it is an unverified claim and state the gap — do NOT average the two.
- If has_documented_income is FALSE: there is NO verified income. Say so directly and present any declared figure only as an unverified claim.
- declared_annual_income_usd_UNVERIFIED is ANNUAL; never put an annual figure in a monthly field. Every "monthly_income_*" field MUST be monthly.

FILL raw_data_table FIRST — all income figures come from the DOCUMENTED values above, never the declared claim:
- monthly_income_original: documented MONTHLY amount + currency from documented_monthly_income_local / documented_currency (e.g. "UAH 35,689/month"). If has_documented_income is false: "N/A — declared only, unverified".
- monthly_income_usd: documented_monthly_income_usd (e.g. "≈ $860 USD/month"). NEVER the declared claim.
- income_vs_national_median: % above/below median, based on the DOCUMENTED figure (e.g. "78% above Ukraine median of UAH 20,000/mo")
- income_vs_sector_median: % vs sector benchmark, based on the DOCUMENTED figure. If a profession OR sector is stated anywhere in the application data, use the corresponding benchmark and never say the sector is unstated. Otherwise return "N/A — sector not stated".
- income_percentile_label: percentile based on the DOCUMENTED figure (e.g. "Top 40% of earners in Ukraine")
- ppp_equivalent_usd: realistic purchasing power of the MONTHLY USD figure (SANITY CHECK: same order of magnitude as monthly_income_usd — never 10x larger)
- sector_benchmark_note: US salary range for the applicant's STATED profession/sector taken from the application data. PROFESSION RULE (STRICT): if NO profession or sector is stated in the data, write "Sector not stated by applicant" — NEVER guess, infer, or invent a profession from transaction counterparties, payer names, country, income level, or anything else. An invented profession is a fabrication that can mislead a lender.
- document_institution: bank name from documents (or "N/A — no income documents" if none)
- document_period: statement period
- income_pattern: regularity AND source type from the documents (e.g. "Irregular — P2P transfers from individuals, not salary")
${ctx.ppp_context_only ? `
PPP RULE (this is a USD-obligation product — rent/loan/mortgage): ppp_equivalent_usd is ORIGIN CONTEXT ONLY. Do NOT headline it and do NOT put PPP or "purchasing-power equivalent" in the strengths array. The recipient collects in USD, so the figure that matters is the documented USD income (monthly_income_usd), never a PPP-inflated number. If income looks strong only in PPP terms, that is NOT a strength for this product.` : ''}

THEN write:
- origin_income_context: 2-3 sentences. What does this income mean IN the origin country? Reference the STATED sector only; if no sector is stated, describe the income without attributing a profession.
- income_transfer_narrative: 2-3 sentences FOR THE RECIPIENT OF THIS DOSSIER. The applicant is applying for: ${ctx.verification_purpose || 'financial verification'}. Underwriting lens for this product: ${ctx.purpose_lens || 'general financial picture'}. Frame the narrative around what THIS product's decision-maker actually evaluates — do not give a generic answer. NEVER assign a US social-class bracket from income alone. Household size, location, gross/net basis, other earners, existing debt and requested amount are unknown unless explicitly supplied; use conditional borrowing-capacity language instead.

Data: ${JSON.stringify(ctx)}
Rules: all scores 0-100. Use actual numbers from country intelligence. Return JSON only.`,

  Behavioral: (ctx) => `Behavioral analyst. Assess consistency of profile data.
${ctx.geo?.already_in_destination ? `Note: the applicant ALREADY resides in the destination (${(ctx.geo.signals || []).join('; ')}). Do NOT flag "no destination presence" as a risk, and do NOT treat them as a prospective migrant.` : ''}
${ctx.income_contradicted ? `CRITICAL: documented income (~$${ctx.documented_monthly_usd}/mo) CONTRADICTS the declared figure (~$${ctx.declared_monthly_usd}/mo, ${ctx.income_discrepancy_pct}% gap). Do NOT state that declared income "matches" experience/sector or that the profile is consistent on income. This income discrepancy MUST appear in risk_signals and lower behavioral_consistency.` : ''}
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

  // DIAGNOSTIC: safe fingerprint of the key actually in use (last 4 chars only).
  const keyFingerprint = apiKey.length >= 4 ? apiKey.slice(-4) : 'short';

  const { agentName, context } = req.body;
  if (!agentName || !context) return res.status(400).json({ error: 'Missing agentName or context' });

  // Log which key is in use — confirms Tier 1 (...7ydQ) vs free (...XyPQ).
  console.log(`[run-agent:${agentName}] using GEMINI_API_KEY ending in ...${keyFingerprint}`);

  const schema = SCHEMAS[agentName];
  const promptFn = PROMPTS[agentName];
  const fallback = FALLBACKS[agentName];

  if (!schema || !promptFn) return res.status(400).json({ error: `Unknown agent: ${agentName}` });

  const ai = new GoogleGenAI({ apiKey });

  // Retry wrapper: on 429 (rate limit), wait and retry with exponential backoff.
  // Free-tier Gemini allows ~10-15 req/min; parallel agents can burst past that.
  const generateWithRetry = async (maxRetries = 3): Promise<any> => {
    let lastErr: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: promptFn(context) }] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            thinkingConfig: { thinkingBudget: 0 },
            // v34.11: 1024 truncated the Country agent's JSON mid-output on verbose runs
            // ("Unexpected end of JSON input" → fallback). 2048 gives headroom; schemas
            // still keep responses compact.
            maxOutputTokens: 2048,
          },
        });
      } catch (err) {
        lastErr = err;
        const msg = String(err);
        const is429 = msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate');
        if (is429 && attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s (+ jitter). Stays within the 60s function budget.
          const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 500;
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  };

  try {
    const response = await generateWithRetry();

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
    const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate');
    // Return fallback — never crash the pipeline.
    return res.status(200).json({
      ...fallback,
      _agent_failed: true,
      _rate_limited: isRateLimit,
      _key_used: `...${keyFingerprint}`,
      _error_reason: (isRateLimit ? 'Rate/quota error. ' : '') + errMsg.slice(0, 180),
    });
  }
}
