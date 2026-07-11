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
    // v34.4 deterministic income engine: the model LISTS credits; the CODE decides what counts.
    credit_transactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date:         { type: Type.STRING },
          description:  { type: Type.STRING },
          counterparty: { type: Type.STRING },
          amount:       { type: Type.NUMBER },
        },
        required: ['date', 'description', 'counterparty', 'amount'],
      },
    },
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
    'currency_code','credit_transactions','average_monthly_inflow','ending_balance','income_regularity',
    'income_sources_detected','salary_deposits_detected','salary_deposit_count',
    'estimated_monthly_obligations','asset_type','asset_estimated_value_local',
    'asset_ownership_confirmed','legibility_score','authenticity_concerns',
    'is_usable','rejection_reason','analyst_note',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// v34.4 DETERMINISTIC INCOME ENGINE
// The LLM transcribes credits; THIS code decides what counts as income.
// Kills run-to-run variance and prompt-dependence of self-transfer traps.
// ═══════════════════════════════════════════════════════════════════════════

type CreditTx = { date: string; description: string; counterparty: string; amount: number };
type AuditEntry = { date: string; counterparty: string; amount: number; reason?: string };

// Normalize any script: strip Latin diacritics, lowercase, collapse punctuation → spaces.
const normTxt = (s: any): string =>
  String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Own-account transfer markers, multilingual, pre-normalized (diacritics already stripped by normTxt).
const SELF_TRANSFER_MARKERS = [
  // Spanish
  'traspaso entre cuentas propias', 'transferencia entre cuentas propias', 'entre cuentas propias',
  'cuentas propias', 'traspaso propio', 'traspaso a cuenta propia',
  // English
  'self transfer', 'own account', 'own acct', 'internal transfer', 'between own accounts',
  'transfer from sav', 'transfer from chk', 'own fund transfer',
  // Portuguese / French / German
  'entre contas proprias', 'conta propria', 'proprias contas',
  'compte propre', 'entre comptes propres', 'virement interne',
  'eigenes konto', 'eigenubertragung', 'uebertrag eigenes',
  // Ukrainian / Russian (both і/и variants)
  'мiж власними рахунками', 'між власними рахунками', 'власнi рахунки', 'власні рахунки',
  'между своими счетами', 'перевод между своими счетами', 'на свой счет',
  // India-specific self-transfer phrasings
  'self imps', 'imps self', 'self neft', 'neft self', 'own a c', 'self a c',
].map(normTxt);

const GENERIC_COMPANY_TOKENS = new Set([
  'llc', 'inc', 'ltd', 'sa', 'de', 'cv', 'sas', 'srl', 'gmbh', 'ooo', 'tov', 'fop',
  'pvt', 'plc', 'co', 'company', 'corp', 'corporation', 'the', 'and', 'group',
]);

const nameTokensOf = (name: string): string[] =>
  normTxt(name).split(' ').filter((t) => t.length >= 3);

// Sender == applicant: ≥2 applicant name tokens present in the counterparty (1 suffices
// for single-token names). Matched against COUNTERPARTY only — descriptions often repeat
// the account holder's own name and would false-positive.
const senderIsApplicant = (counterpartyNorm: string, applicantTokens: string[]): boolean => {
  if (applicantTokens.length === 0 || !counterpartyNorm) return false;
  const hits = applicantTokens.filter((t) => counterpartyNorm.includes(t)).length;
  return applicantTokens.length === 1 ? hits >= 1 : hits >= 2;
};

// Self-employed/owner moving money from their own company is self-funding, not income.
const isOwnCompany = (counterpartyNorm: string, employerTokens: string[]): boolean =>
  employerTokens.length > 0 && employerTokens.some((t) => counterpartyNorm.includes(t));

// Parse statement dates: ISO first, then day-first (top-20 origins are day-first).
const parseTxDate = (s: string): Date | null => {
  const str = String(s || '').trim();
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) { const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return isNaN(d.getTime()) ? null : d; }
  m = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    const yr = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    const d = new Date(Date.UTC(yr, +m[2] - 1, +m[1])); // day-first
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const runIncomeEngine = (
  rawTxs: any[],
  applicantName: string,
  employerName: string,
  employmentType: string,
  llmPeriodMonths: number,
) => {
  const txs: CreditTx[] = (Array.isArray(rawTxs) ? rawTxs : [])
    .slice(0, 150)
    .map((t: any) => ({
      date: String(t?.date || ''),
      description: String(t?.description || ''),
      counterparty: String(t?.counterparty || ''),
      amount: Number(t?.amount) || 0,
    }))
    .filter((t) => t.amount > 0);

  if (txs.length === 0) return null;

  const applicantTokens = nameTokensOf(applicantName);
  const selfRun = /self|freelan|owner|business|contractor/i.test(employmentType || '');
  const employerTokens = selfRun
    ? normTxt(employerName).split(' ').filter((t) => t.length >= 4 && !GENERIC_COMPANY_TOKENS.has(t))
    : [];

  const counted: AuditEntry[] = [];
  const excluded: AuditEntry[] = [];
  for (const tx of txs) {
    const cpNorm = normTxt(tx.counterparty);
    const allNorm = `${normTxt(tx.description)} ${cpNorm}`;
    const entry: AuditEntry = { date: tx.date, counterparty: tx.counterparty || tx.description.slice(0, 60), amount: tx.amount };
    if (SELF_TRANSFER_MARKERS.some((mk) => allNorm.includes(mk))) {
      excluded.push({ ...entry, reason: 'self_transfer_marker' });
    } else if (senderIsApplicant(cpNorm, applicantTokens)) {
      excluded.push({ ...entry, reason: 'sender_is_applicant' });
    } else if (isOwnCompany(cpNorm, employerTokens)) {
      excluded.push({ ...entry, reason: 'own_company' });
    } else {
      counted.push(entry);
    }
  }

  const countedTotal = counted.reduce((s, t) => s + t.amount, 0);

  // Period: trust the statement header (LLM) when present; else derive from tx date span.
  let periodMonths = llmPeriodMonths > 0 ? llmPeriodMonths : 0;
  const dates = txs.map((t) => parseTxDate(t.date)).filter((d): d is Date => !!d);
  if (periodMonths <= 0 && dates.length >= 2) {
    const span = (Math.max(...dates.map(Number)) - Math.min(...dates.map(Number))) / (30.44 * 86400e3);
    periodMonths = Math.min(36, Math.max(0.25, Math.round(span * 4) / 4));
  }
  if (periodMonths <= 0) periodMonths = 1;

  // Deterministic regularity from counted credits.
  const monthKeys = new Set(
    counted.map((t) => { const d = parseTxDate(t.date); return d ? `${d.getUTCFullYear()}-${d.getUTCMonth()}` : ''; }).filter(Boolean),
  );
  const payerCounts = new Map<string, number>();
  for (const t of counted) {
    const k = normTxt(t.counterparty);
    payerCounts.set(k, (payerCounts.get(k) || 0) + 1);
  }
  const hasRepeatPayer = [...payerCounts.values()].some((n) => n >= 2);
  let regularity: string;
  if (counted.length === 1) regularity = 'Single entry';
  else if (counted.length >= 3 && monthKeys.size >= 2 && (hasRepeatPayer || payerCounts.size >= 2)) regularity = 'Regular';
  else regularity = 'Irregular';

  const uniquePayers = [...new Set(counted.map((t) => t.counterparty))].slice(0, 8);

  return {
    average_monthly_inflow: Math.round(countedTotal / periodMonths),
    income_regularity: regularity,
    income_sources_detected: uniquePayers,
    income_audit: {
      engine: 'deterministic' as const,
      period_months_used: periodMonths,
      counted_total: Math.round(countedTotal),
      counted_count: counted.length,
      excluded_count: excluded.length,
      counted: counted.slice(0, 60),
      excluded: excluded.slice(0, 30),
    },
  };
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
- credit_transactions: THE MOST IMPORTANT FIELD. List EVERY single incoming credit (money IN) shown in the statement, up to 120 entries, in document order. Do NOT filter, do NOT judge, do NOT skip anything — include self-transfers, own-account moves, salary, client payments, refunds, everything that increased the balance. The system decides later what counts as income; your job is a faithful transcript. Per entry: date = the posted date, normalized to YYYY-MM-DD when determinable (else as printed); description = the transaction line text VERBATIM (trim to 90 chars, keep original language/script); counterparty = the SENDER name or entity exactly as printed — if non-Latin script, append a Latin transliteration in parentheses; if no sender is identifiable, repeat the key words of the description; amount = positive number in the document currency (no separators). Do NOT include outgoing debits here.
- average_monthly_inflow: FALLBACK ONLY (the system recomputes from credit_transactions). Your best estimate of monthly THIRD-PARTY income: total credits over the period divided by period_months, excluding self-funding — (a) senders matching the applicant "${applicantName}" in any script, (b) own-account transfers ("TRASPASO ENTRE CUENTAS PROPIAS", "self transfer", "перевод между своими счетами" and equivalents), (c) for self-employed/freelance/owner applicants, deposits from "${employerName || 'their own company'}". For salaried applicants employer deposits ARE income. Repeat payments from the same third-party client are NORMAL income. Do NOT annualize a partial period.
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
        // v34.4: the credit_transactions transcript needs room (up to 120 entries).
        maxOutputTokens: 8000,
      },
    });

    let jsonStr = (response.text || '{}').trim();
    if (jsonStr.includes('```')) {
      const m = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) jsonStr = m[1];
    }

    const result = JSON.parse(jsonStr);

    // v34.4 — DETERMINISTIC INCOME ENGINE: recompute inflow/regularity/sources from the
    // transaction transcript. The LLM's own average_monthly_inflow survives only as a
    // fallback when no transcript came back (e.g. truncated output).
    const engineOut = runIncomeEngine(
      result.credit_transactions,
      applicantName || '',
      employerName || '',
      employmentType || '',
      Number(result.period_months) || 0,
    );
    if (engineOut) {
      result.average_monthly_inflow = engineOut.average_monthly_inflow;
      result.income_regularity = engineOut.income_regularity;
      if (engineOut.income_sources_detected.length > 0) {
        result.income_sources_detected = engineOut.income_sources_detected;
      }
      result.income_audit = engineOut.income_audit;
    } else {
      result.income_audit = {
        engine: 'llm_fallback',
        note: 'No transaction transcript returned; income figure is a model estimate.',
      };
    }
    delete result.credit_transactions; // audit carries the counted/excluded detail; keep payload lean

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
      income_audit: { engine: 'llm_fallback', note: 'Document processing failed.' },
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
