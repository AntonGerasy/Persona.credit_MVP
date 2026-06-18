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

const PROMPT = (applicantName: string, fieldLabel: string, originCountry: string, destinationCountry: string) =>
`Extract financial data from this document. Applicant: ${applicantName}. Origin: ${originCountry}. Destination: ${destinationCountry}. Field: ${fieldLabel}.
Rules:
- account_holder_name_match: "Match"/"Partial match"/"No match"/"Cannot determine" vs "${applicantName}"
- currency_code: ISO 4217 (UAH, USD, INR, BRL etc)
- average_monthly_inflow: average monthly credits/income
- income_regularity: "Regular"/"Irregular"/"Single entry"
- is_usable: false only if blank/unreadable/irrelevant
- analyst_note: 1 sentence what this proves
- Return 0 for missing numbers, "" for missing strings
- JSON only.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service not configured' });

  const { fileBase64, mimeType, fieldLabel, applicantName, originCountry, destinationCountry } = req.body;
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
      model: 'gemini-2.5-flash-preview-05-20',
      contents: {
        parts: [
          { text: PROMPT(applicantName || 'Unknown', fieldLabel || 'Financial Document', originCountry || '', destinationCountry || '') },
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
