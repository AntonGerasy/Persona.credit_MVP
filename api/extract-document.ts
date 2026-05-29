/**
 * POST /api/extract-document
 *
 * Extracts structured financial data from a foreign document using Gemini Vision.
 * Returns ExtractedDocument shape used by scoring agents.
 *
 * Body (JSON):
 *   { fileBase64: string, mimeType: string, fieldLabel: string,
 *     applicantName: string, originCountry: string, destinationCountry: string }
 *
 * Response: ExtractedDocument JSON object
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const extractedDocumentSchema = {
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
    currency_name:               { type: Type.STRING },
    average_monthly_inflow:      { type: Type.NUMBER },
    total_inflow:                { type: Type.NUMBER },
    ending_balance:              { type: Type.NUMBER },
    largest_single_inflow:       { type: Type.NUMBER },
    income_regularity:           { type: Type.STRING },
    income_sources_detected:     { type: Type.ARRAY, items: { type: Type.STRING } },
    salary_deposits_detected:    { type: Type.BOOLEAN },
    salary_deposit_count:        { type: Type.NUMBER },
    loan_repayments_detected:    { type: Type.BOOLEAN },
    estimated_monthly_obligations: { type: Type.NUMBER },
    asset_type:                  { type: Type.STRING },
    asset_estimated_value_local: { type: Type.NUMBER },
    asset_ownership_confirmed:   { type: Type.BOOLEAN },
    legibility_score:            { type: Type.NUMBER },
    authenticity_signals:        { type: Type.ARRAY, items: { type: Type.STRING } },
    authenticity_concerns:       { type: Type.ARRAY, items: { type: Type.STRING } },
    is_usable:                   { type: Type.BOOLEAN },
    rejection_reason:            { type: Type.STRING },
    analyst_note:                { type: Type.STRING },
  },
  required: [
    'document_type', 'issuing_institution', 'issuing_country', 'detected_language',
    'period_covered', 'period_months', 'account_holder_name', 'account_holder_name_match',
    'currency_code', 'currency_name', 'average_monthly_inflow', 'total_inflow',
    'ending_balance', 'largest_single_inflow', 'income_regularity',
    'income_sources_detected', 'salary_deposits_detected', 'salary_deposit_count',
    'loan_repayments_detected', 'estimated_monthly_obligations',
    'asset_type', 'asset_estimated_value_local', 'asset_ownership_confirmed',
    'legibility_score', 'authenticity_signals', 'authenticity_concerns',
    'is_usable', 'rejection_reason', 'analyst_note',
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const { fileBase64, mimeType, fieldLabel, applicantName, originCountry, destinationCountry } = req.body;

  if (!fileBase64 || !mimeType) {
    return res.status(400).json({ error: 'Missing fileBase64 or mimeType' });
  }

  if (fileBase64.length > 28_000_000) {
    return res.status(400).json({ error: 'File too large (max 20MB)' });
  }

  const prompt = `DOCUMENT EXTRACTION AGENT — PERSONA.CREDIT

You are a senior financial document analyst specialising in cross-border immigration cases.
Extract structured financial data from this document.

APPLICANT CONTEXT:
- Name on file: ${applicantName || 'Unknown'}
- Origin country: ${originCountry || 'Unknown'}
- Destination country: ${destinationCountry || 'Unknown'}
- Document field: "${fieldLabel || 'Financial Document'}"

This document may be in ANY language — Ukrainian, Hindi, Portuguese, Polish, Arabic, etc.
Read and interpret it regardless of language.

EXTRACTION RULES:

1. DOCUMENT TYPE: bank statement, payslip, tax return, property deed, investment statement, etc.

2. FINANCIAL DATA (bank statements / payslips):
   - Extract ALL figures in ORIGINAL currency — do NOT convert to USD.
   - currency_code: ISO 4217 (UAH, INR, BRL, PLN, etc.)
   - average_monthly_inflow: calculate from the statement period.
   - income_regularity: "Regular" / "Irregular" / "Single entry" / "Seasonal"
   - salary_deposits_detected: true if recurring same-amount credits from employer visible.

3. ASSET DOCUMENTS (property deeds, investment statements):
   - asset_type: "Real estate" / "Investment portfolio" / "Vehicle" / "Other" / "N/A"
   - asset_estimated_value_local: value in local currency as stated, 0 if not a value document.
   - asset_ownership_confirmed: true only if name on document matches applicant name.

4. IDENTITY CROSS-CHECK:
   - account_holder_name: exact name as it appears.
   - account_holder_name_match: "Match" / "Partial match" / "No match" / "Cannot determine"
     Compare against: "${applicantName || 'Unknown'}"

5. AUTHENTICITY:
   - legibility_score: 0–100.
   - authenticity_signals: institutional markers confirmed.
   - authenticity_concerns: anything suspicious.
   - is_usable: false ONLY if completely unreadable, clearly irrelevant, or critically tampered.
   - rejection_reason: why if is_usable is false, otherwise empty string.

6. analyst_note: 1–2 sentences summarising what this document proves and its key limitation.

STRICT RULES:
- Return 0 for numbers not visible, empty string for text not visible.
- Do NOT invent figures.
- Do NOT convert currencies.
- STRICT JSON only. No markdown. No explanation outside the JSON.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType || 'application/octet-stream', data: fileBase64 } },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: extractedDocumentSchema,
      },
    });

    let jsonStr = (response.text || '{}').trim();
    if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
    }

    const result = JSON.parse(jsonStr);
    return res.status(200).json(result);
  } catch (err) {
    console.error('extract-document error:', err);
    return res.status(500).json({ error: 'Document extraction failed', detail: String(err) });
  }
}
