import { Type } from '@google/genai';

/**
 * DOCUMENT EXTRACTOR AGENT
 *
 * This is the core engine of the product. It reads any foreign-language
 * financial document — bank statement from Privatbank, payslip from India,
 * property deed from Brazil — and returns structured, machine-readable data.
 *
 * Output feeds directly into the Financial and Identity agents as
 * primary evidence, replacing self-declared figures with document-verified ones.
 */

export const extractedDocumentSchema = {
    type: Type.OBJECT,
    properties: {
        document_type: { type: Type.STRING },
        issuing_institution: { type: Type.STRING },
        issuing_country: { type: Type.STRING },
        detected_language: { type: Type.STRING },
        period_covered: { type: Type.STRING },
        period_months: { type: Type.NUMBER },

        // Identity signals
        account_holder_name: { type: Type.STRING },
        account_holder_name_match: { type: Type.STRING },

        // Financial signals
        currency_code: { type: Type.STRING },
        currency_name: { type: Type.STRING },
        average_monthly_inflow: { type: Type.NUMBER },
        total_inflow: { type: Type.NUMBER },
        ending_balance: { type: Type.NUMBER },
        largest_single_inflow: { type: Type.NUMBER },
        income_regularity: { type: Type.STRING },
        income_sources_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
        salary_deposits_detected: { type: Type.BOOLEAN },
        salary_deposit_count: { type: Type.NUMBER },

        // Debt / liability signals
        loan_repayments_detected: { type: Type.BOOLEAN },
        estimated_monthly_obligations: { type: Type.NUMBER },

        // Asset signals (for property deeds, investment statements)
        asset_type: { type: Type.STRING },
        asset_estimated_value_local: { type: Type.NUMBER },
        asset_ownership_confirmed: { type: Type.BOOLEAN },

        // Document quality
        legibility_score: { type: Type.NUMBER },
        authenticity_signals: { type: Type.ARRAY, items: { type: Type.STRING } },
        authenticity_concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
        is_usable: { type: Type.BOOLEAN },
        rejection_reason: { type: Type.STRING },

        // Context note for downstream agents
        analyst_note: { type: Type.STRING },
    },
    required: [
        'document_type', 'issuing_institution', 'issuing_country',
        'detected_language', 'period_covered', 'period_months',
        'account_holder_name', 'account_holder_name_match',
        'currency_code', 'currency_name',
        'average_monthly_inflow', 'total_inflow', 'ending_balance',
        'income_regularity', 'income_sources_detected',
        'salary_deposits_detected', 'salary_deposit_count',
        'loan_repayments_detected', 'estimated_monthly_obligations',
        'asset_type', 'asset_estimated_value_local', 'asset_ownership_confirmed',
        'legibility_score', 'authenticity_signals', 'authenticity_concerns',
        'is_usable', 'rejection_reason', 'analyst_note',
        'largest_single_inflow',
    ],
};

export type ExtractedDocument = {
    document_type: string;
    issuing_institution: string;
    issuing_country: string;
    detected_language: string;
    period_covered: string;
    period_months: number;
    account_holder_name: string;
    account_holder_name_match: string;
    currency_code: string;
    currency_name: string;
    average_monthly_inflow: number;
    inflow_unverified?: boolean;
    total_inflow: number;
    ending_balance: number;
    largest_single_inflow: number;
    income_regularity: string;
    income_sources_detected: string[];
    salary_deposits_detected: boolean;
    salary_deposit_count: number;
    loan_repayments_detected: boolean;
    estimated_monthly_obligations: number;
    asset_type: string;
    asset_estimated_value_local: number;
    asset_ownership_confirmed: boolean;
    legibility_score: number;
    authenticity_signals: string[];
    authenticity_concerns: string[];
    is_usable: boolean;
    rejection_reason: string;
    analyst_note: string;
    extraction_completeness?: 'complete' | 'partial' | 'unreadable';
    extraction_diagnostics?: any;
    income_is_lower_bound?: boolean;
    source_file_name?: string;
    source_field_label?: string;
};

export const getDocumentExtractorPrompt = (
    fieldLabel: string,
    applicantName: string,
    originCountry: string,
    destinationCountry: string,
): string => `
DOCUMENT EXTRACTION AGENT — PERSONA.CREDIT

You are a senior financial document analyst specialising in cross-border immigration cases.
Your task is to extract structured financial data from a document uploaded by an applicant.

APPLICANT CONTEXT:
- Name on file: ${applicantName}
- Origin country: ${originCountry}
- Destination country: ${destinationCountry}
- Document field: "${fieldLabel}"

YOUR TASK:
Analyse the attached document image or PDF and extract every available data point.
This document may be in ANY language — Ukrainian, Hindi, Portuguese, Polish, Arabic, etc.
You are expected to read and interpret it regardless of language.

EXTRACTION RULES:

1. DOCUMENT TYPE IDENTIFICATION
   Identify what this document is: bank statement, payslip, tax return, property deed,
   investment statement, employment contract, utility bill, etc.
   Use the field label as a hint but trust what you actually see.

2. FINANCIAL DATA EXTRACTION (for bank statements and payslips)
   - Extract ALL monetary figures in their ORIGINAL currency — do NOT convert.
   - currency_code: ISO 4217 code (UAH, INR, BRL, PLN, etc.)
   - average_monthly_inflow: calculate from the statement period if multiple months shown
   - income_regularity: "Regular" / "Irregular" / "Single entry" / "Seasonal"
   - salary_deposits_detected: look for recurring same-amount credits, employer name patterns
   - List all detected income sources (employer name, freelance, rental, transfers)

3. ASSET DOCUMENT EXTRACTION (for property deeds, investment statements)
   - asset_type: "Real estate", "Investment portfolio", "Vehicle", "Other", or "N/A"
   - asset_estimated_value_local: value in local currency as stated, 0 if not a value document
   - asset_ownership_confirmed: true only if name on document matches applicant name

4. IDENTITY CROSS-CHECK
   - account_holder_name: exact name as it appears on the document
   - account_holder_name_match: "Match" / "Partial match" / "No match" / "Cannot determine"
     Compare against applicant name: "${applicantName}"

5. AUTHENTICITY ASSESSMENT
   - legibility_score: 0–100. How readable and clear is the document?
   - authenticity_signals: list institutional markers you can confirm
     (bank logo, account number format, official stamp, transaction IDs, IBAN format, etc.)
   - authenticity_concerns: list anything suspicious
     (pixel artefacts, inconsistent fonts, missing institutional markers, blurry sections)
   - is_usable: false ONLY if document is completely unreadable, clearly irrelevant
     (selfie, meme, blank page), or has critical authenticity concerns
   - rejection_reason: describe why if is_usable is false, otherwise leave empty string

6. ANALYST NOTE
   Write 1–2 sentences summarising what this document proves and its key limitation.
   Example: "6-month Privatbank statement confirms regular salary deposits averaging
   UAH 82,000/month from a single employer. Period ends March 2026."

STRICT ANTI-HALLUCINATION RULES:
- If a field cannot be determined from the document, return 0 for numbers, empty string for text, false for booleans.
- Do NOT invent account numbers, balances, or names not visible in the document.
- Do NOT convert currencies — return original figures only.
- Return STRICT JSON only. No markdown. No explanation outside the JSON.
`;
