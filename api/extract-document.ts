/**
 * POST /api/extract-document
 * Vercel Hobby: 10s hard limit.
 *
 * PDF parsing fix:
 * - For PDFs: uses Gemini Files API (upload → URI reference)
 *   This bypasses the 4.5MB JSON body limit on Vercel
 * - For images: uses inlineData directly (faster, < 1MB usually)
 * - thinkingBudget: 0, maxOutputTokens: 500
 */

export const maxDuration = 60; // Vercel Hobby supports up to 60s via module-level export

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const extractSchema = {
  type: Type.OBJECT,
  properties: {
    document_type:               { type: Type.STRING },
    issuing_institution:         { type: Type.STRING },
    issuing_country:             { type: Type.STRING },
    detected_language:           { type: Type.STRING },
    period_covered:              { type: Type.STRING },
    period_months:               { type: Type.NUMBER },
    account_holder_name:         { type: Type.STRING },
    account_holder_name_match:   { type: Type.STRING },
    currency_code:               { type: Type.STRING },
    usd_rate_estimate:           { type: Type.NUMBER },
    average_monthly_inflow:      { type: Type.NUMBER },
    ending_balance:              { type: Type.NUMBER },
    income_regularity:           { type: Type.STRING },
    income_sources_detected:     { type: Type.ARRAY, items: { type: Type.STRING } },
    salary_deposits_detected:    { type: Type.BOOLEAN },
    salary_deposit_count:        { type: Type.NUMBER },
    estimated_monthly_obligations:{ type: Type.NUMBER },
    asset_type:                  { type: Type.STRING },
    asset_estimated_value_local: { type: Type.NUMBER },
    asset_ownership_confirmed:   { type: Type.BOOLEAN },
    legibility_score:            { type: Type.NUMBER },
    authenticity_concerns:       { type: Type.ARRAY, items: { type: Type.STRING } },
    is_usable:                   { type: Type.BOOLEAN },
    rejection_reason:            { type: Type.STRING },
    analyst_note:                { type: Type.STRING },
  },
  required: [
    'document_type','issuing_institution','issuing_country','detected_language',
    'period_covered','period_months','account_holder_name','account_holder_name_match',
    'currency_code','average_monthly_inflow','ending_balance','income_regularity',
    'income_sources_detected','salary_deposits_detected','salary_deposit_count',
    'estimated_monthly_obligations','asset_type','asset_estimated_value_local',
    'asset_ownership_confirmed','legibility_score','authenticity_concerns',
    'is_usable','rejection_reason','analyst_note',
  ],
};

const PROMPT = (applicantName: string, fieldLabel: string, originCountry: string, destinationCountry: string, employerName: string, employmentType: string) =>
`Extract financial data from this document. Applicant: ${applicantName}. Origin: ${originCountry}. Destination: ${destinationCountry}. Field: ${fieldLabel}.
Applicant's stated employer/company: ${employerName || 'not provided'}. Employment type: ${employmentType || 'not provided'}.
TODAY'S DATE IS ${new Date().toISOString().slice(0, 10)} — treat any date on or before today as a normal past date, never as "future".
LANGUAGE: the document may be in ANY language and script (Cyrillic, Arabic, Chinese, Devanagari, etc.). Read it in its native language. Return issuing_country and issuing_institution in ENGLISH; transliterate person names to Latin script where needed for matching, but keep original payer names in income_sources_detected with a Latin transliteration in parentheses.
Rules:
- account_holder_name_match: "Match"/"Partial match"/"No match"/"Cannot determine" vs "${applicantName}". Compare ACROSS scripts and transliterations (e.g. Cyrillic "Герасименко Антон" matches Latin "Anton Gerasymenko"; Arabic names likewise).
- currency_code: ISO 4217 (UAH, USD, SYP, INR, BRL etc)
- usd_rate_estimate: your best estimate of how many units of currency_code equal 1 USD around the statement period (e.g. UAH → 41.5). Return 0 if the currency is USD or you are not reasonably sure. This is a fallback only.
- average_monthly_inflow: TOTAL third-party credits over the period DIVIDED BY period_months. Do NOT annualize or inflate a partial period. SELF-FUNDING IS NOT INCOME — EXCLUDE: (a) transfers where the SENDER'S NAME matches the account holder / applicant (any script or transliteration, e.g. a Wise transfer from "${applicantName}" to themselves); (b) transfers between the applicant's OWN accounts IN ANY LANGUAGE — recognize local phrasings such as "TRASPASO ENTRE CUENTAS PROPIAS" / "TRANSFERENCIA ENTRE CUENTAS PROPIAS" (es), "transfer from SAV/CHK", "self transfer", "own account", "перевод між власними рахунками / перевод между своими счетами", "eigenes Konto", "compte propre", "próprias contas" — and equivalents in the document's language; (c) if employment type indicates self-employed/freelance/owner, deposits from "${employerName || 'their own company'}" or any company variant of it (LLC/Inc/Ltd) — that is the applicant moving their own business money. If employment type indicates salaried employment, deposits from the employer ARE salary income. IMPORTANT: a REPEAT payment from the SAME third-party client/payer is NORMAL income (repeat clients are not self-funding) — count every third-party client payment, including multiple invoices from one client.
- estimated_monthly_obligations: recurring monthly outflows clearly shown (rent, loan/utility autopay). Return 0 if not clearly determinable — do NOT guess. Must not exceed average_monthly_inflow unless the statement clearly shows deficit spending.
- income_regularity: "Regular" ONLY for recurring similar-sized deposits (e.g. monthly salary). Lump/one-off/self/P2P transfers → "Irregular" or "Single entry".
- income_sources_detected: name the payers/sources that COUNTED as income; note if they are individuals (P2P). List excluded self-funding separately in analyst_note if significant.
- is_usable: false only if blank/unreadable/irrelevant
- analyst_note: 1 sentence what this proves (mention excluded self-transfers if any)
- Return 0 for missing numbers, "" for missing strings
- JSON only.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { fileBase64, mimeType, fieldLabel, applicantName, originCountry, destinationCountry, employerName, employmentType } = req.body;
  if (!fileBase64 || !mimeType) return res.status(400).json({ error: 'Missing fileBase64 or mimeType' });

  const ai = new GoogleGenAI({ apiKey });
  const isPDF = mimeType === 'application/pdf' || mimeType === 'application/octet-stream';

  try {
    let filePart: any;

    if (isPDF) {
      // PDFs: upload via Files API to avoid 4.5MB body limit
      // Convert base64 string back to Buffer for upload
      const fileBuffer = Buffer.from(fileBase64, 'base64');

      // Use the upload method from Gemini Files API
      const uploadResponse = await ai.files.upload({
        file: new Blob([fileBuffer], { type: 'application/pdf' }),
        config: { mimeType: 'application/pdf' },
      });

      if (!uploadResponse?.uri) {
        throw new Error('File upload to Gemini Files API failed — no URI returned');
      }

      filePart = {
        fileData: {
          mimeType: 'application/pdf',
          fileUri: uploadResponse.uri,
        },
      };
    } else {
      // Images: inline data is fine (usually < 1MB)
      // Validate size — prevent body overflows
      if (fileBase64.length > 5_000_000) {
        return res.status(400).json({ error: 'Image too large for inline processing (max ~3.7MB). Please use PDF format.' });
      }
      filePart = {
        inlineData: {
          mimeType: mimeType,
          data: fileBase64,
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: PROMPT(applicantName || 'Unknown', fieldLabel || 'Financial Document', originCountry || '', destinationCountry || '', employerName || '', employmentType || '') },
          filePart,
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: extractSchema,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 500,
      },
    });

    let jsonStr = (response.text || '{}').trim();
    if (jsonStr.includes('```')) {
      const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) jsonStr = m[1];
    }

    const result = JSON.parse(jsonStr);

    // #7 — deterministic sanity guards (do not trust raw LLM magnitudes blindly):
    const inflow = Number(result.average_monthly_inflow) || 0;
    let obligations = Number(result.estimated_monthly_obligations) || 0;
    // Obligations can't credibly exceed inflow unless clear deficit — clamp the common hallucination.
    if (inflow > 0 && obligations > inflow) {
      obligations = inflow;
      result.estimated_monthly_obligations = obligations;
    }
    // A sub-month / partial period cannot establish "Regular" income — downgrade honestly.
    const periodMonths = Number(result.period_months) || 0;
    if (periodMonths > 0 && periodMonths < 1 && result.income_regularity === 'Regular') {
      result.income_regularity = 'Irregular';
    }
    // Flag inflow whose magnitude the system could not corroborate, so the UI can label it as such.
    result.inflow_unverified =
      inflow > 0 && (result.income_regularity !== 'Regular' || (periodMonths > 0 && periodMonths < 1));

    return res.status(200).json(result);

  } catch (err) {
    console.error('[extract-document]', String(err));
    // Return a usable fallback — don't kill the pipeline
    return res.status(200).json({
      document_type: 'Unknown',
      issuing_institution: 'Unknown',
      issuing_country: originCountry || 'Unknown',
      detected_language: 'Unknown',
      period_covered: '',
      period_months: 0,
      account_holder_name: '',
      account_holder_name_match: 'Cannot determine',
      currency_code: '',
      average_monthly_inflow: 0,
      ending_balance: 0,
      income_regularity: 'Unknown',
      income_sources_detected: [],
      salary_deposits_detected: false,
      salary_deposit_count: 0,
      estimated_monthly_obligations: 0,
      asset_type: 'N/A',
      asset_estimated_value_local: 0,
      asset_ownership_confirmed: false,
      legibility_score: 0,
      authenticity_concerns: ['Document processing failed: ' + String(err).slice(0, 100)],
      is_usable: false,
      rejection_reason: 'Processing error: ' + String(err).slice(0, 150),
      analyst_note: 'Document could not be processed. Manual review required.',
    });
  }
}
