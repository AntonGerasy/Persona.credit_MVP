/**
 * POST /api/validate-file
 *
 * Validates an uploaded document file using Gemini Vision.
 * API key stays server-side — never exposed to the browser bundle.
 *
 * Body (JSON):
 *   { fileBase64: string, mimeType: string, fieldLabel: string,
 *     fieldSubLabel?: string, applicantName: string }
 *
 * Response:
 *   { isValid: boolean, reason: string }
 */

export const maxDuration = 60; // Vercel Hobby supports up to 60s via module-level export


import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in Vercel environment');
    // Fail-open: accept the file, flag it for manual review
    return res.status(200).json({
      isValid: true,
      reason: 'Document accepted. AI scan unavailable — ensure GEMINI_API_KEY is set in Vercel environment variables.',
    });
  }

  const { fileBase64, mimeType, fieldLabel, fieldSubLabel, applicantName } = req.body;

  if (!fileBase64 || !mimeType || !fieldLabel) {
    return res.status(400).json({ error: 'Missing required fields: fileBase64, mimeType, fieldLabel' });
  }

  // Validate base64 size (max ~20MB)
  if (fileBase64.length > 28_000_000) {
    return res.status(400).json({
      isValid: false,
      reason: 'File too large. Please upload a file under 20MB.',
    });
  }

  const validationSchema = {
    type: Type.OBJECT,
    properties: {
      isValid: { type: Type.BOOLEAN },
      reason: { type: Type.STRING },
    },
    required: ['isValid', 'reason'],
  };

  const promptText = `You are a document intake analyst for Persona.Credit, a cross-border financial verification service.
An applicant has uploaded a file for the form field: "${fieldLabel}" ${fieldSubLabel ? `(${fieldSubLabel})` : ''}.
Applicant name on file: ${applicantName || 'Unknown'}.

TASK: Determine if this document is usable for financial verification purposes.

1. RELEVANCE: Is this document appropriate for "${fieldLabel}"?
   - Bank statements, payslips, tax documents, property deeds, investment statements = valid.
   - Photos of people, animals, landscapes, blank pages, memes, unrelated receipts = invalid.
   - If irrelevant: reason = "Irrelevant document — this does not appear to be a ${fieldLabel}."

2. RECENCY:
   - Origin country documents: 2022–2026 are acceptable (wartime/economic disruption context considered).
   - Destination country documents: must be from the last 12 months.
   - Note if outdated but do not reject origin-country historical documents unless severely stale.

3. LEGIBILITY: Is the document readable? Can key figures be extracted?
   - Mark invalid only if completely unreadable or clearly tampered.

4. QUICK EXTRACTION (if valid): Note the institution name and period/date visible in the document.

Respond STRICTLY in valid JSON only. No conversational text.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: {
        parts: [
          { text: promptText },
          { inlineData: { mimeType: mimeType || 'application/octet-stream', data: fileBase64 } },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: validationSchema,
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
    console.error('validate-file error:', err);
    // Fail-open on API errors — don't block file upload
    return res.status(200).json({
      isValid: true,
      reason: 'Document accepted (AI scan encountered an error — will be reviewed manually).',
    });
  }
}
