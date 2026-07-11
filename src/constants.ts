import { FormSchema } from './types';

export const PROFESSIONAL_LOADING_MESSAGES = [
    "Reading your documents...",
    "Contextualising origin country income...",
    "Running financial stability analysis...",
    "Cross-validating document data...",
    "Generating lender-ready dossier..."
];

export const PROVIDER_LOADING_MESSAGES = [
    "Initializing secure verification environment...",
    "Reviewing public professional records...",
    "Analyzing provided financial evidence...",
    "Verifying identity markers...",
    "Confirming document authenticity...",
    "Cross-validating evidence...",
    "Calculating Trust Score...",
    "Finalizing profile..."
];

export const TR_SECTORS = [
  'Tech & Engineering',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Legal',
  'Manufacturing',
  'Retail',
  'Other'
];

export const TR_ROLES = [
  'Individual Contributor',
  'Manager',
  'Director',
  'VP/Executive',
  'Owner/Founder'
];

export const TR_PURPOSES = [
  'Apartment Rental',
  'Credit Card',
  'Auto Financing',
  'Personal Loan',
  'Mortgage',
  'Utility Setup'
];

export const TR_INSTITUTION_TYPES = [
  'Property Manager',
  'Bank / Credit Union',
  'Auto Dealer',
  'Credit Provider',
  'Other'
];

export const formSchema: FormSchema = {
  "title": "Persona.Credit Verification",
  "language": "en",
  "sections": [

    // ─── SECTION 1: CONTEXT ───────────────────────────────────────────────────
    {
      "id": "destination",
      "title": "Verification Context",
      "description": "Tell us where you're applying. This determines how your financial profile will be presented to lenders.",
      "fields": [
        {
          "id": "target_jurisdiction",
          "label": "Destination Country",
          "type": "select",
          "options": [
            { "id": "United States", "label": "United States" },
            { "id": "Canada",        "label": "Canada" },
            { "id": "United Kingdom","label": "United Kingdom" },
            { "id": "Germany",       "label": "Germany" },
            { "id": "UAE",           "label": "UAE" },
            { "id": "Australia",     "label": "Australia" },
            { "id": "France",        "label": "France" },
            { "id": "Other",         "label": "Other" }
          ],
          "required": true,
          "tooltip": "The country where you will present this dossier to a lender or landlord."
        },
        {
          "id": "verification_purpose",
          "label": "What are you applying for?",
          "type": "select",
          "options": [
            { "id": "apartment_rental", "label": "Apartment / Housing Rental" },
            { "id": "personal_loan",    "label": "Personal Loan" },
            { "id": "auto_financing",   "label": "Auto Financing" },
            { "id": "credit_card",      "label": "Credit Card" },
            { "id": "mortgage",         "label": "Mortgage" },
            { "id": "business_account", "label": "Business / Bank Account" },
            { "id": "other",            "label": "Other" }
          ],
          "required": true,
          "tooltip": "Helps us tailor the dossier language and emphasis for the right type of lender."
        }
      ]
    },

    // ─── SECTION 2: IDENTITY ──────────────────────────────────────────────────
    {
      "id": "identity",
      "title": "Personal Identity",
      "description": "Basic information to anchor your profile. The name here must match the name on your documents.",
      "fields": [
        {
          "id": "full_name",
          "label": "Full Legal Name",
          "type": "text",
          "required": true,
          "placeholder": "Exactly as shown on your passport or government ID"
        },
        {
          "id": "dob",
          "label": "Date of Birth",
          "type": "date",
          "required": true
        },
        {
          "id": "citizenship",
          "label": "Country of Citizenship",
          "type": "text",
          "required": true,
          "datalistId": "countries-list",
          "placeholder": "e.g. Ukraine, India, Brazil"
        },
        {
          "id": "country_of_origin",
          "label": "Country Where Your Financial History Is Based",
          "type": "country",
          "required": true,
          "datalistId": "countries-list",
          "tooltip": "The country whose bank statements, payslips, and documents you will upload. This may differ from citizenship."
        },
        {
          "id": "years_in_destination",
          "label": "How long have you been in the destination country? (months)",
          "type": "number",
          "min": 0,
          "required": false,
          "placeholder": "Enter 0 if you haven't moved yet",
          "tooltip": "Helps us contextualise whether you have any local financial history yet."
        }
      ]
    },

    // ─── SECTION 3: PROFESSIONAL PROFILE ─────────────────────────────────────
    {
      "id": "professional",
      "title": "Professional Profile",
      "description": "Your professional background determines earning potential in the destination country — a key factor for lenders.",
      "fields": [
        {
          "id": "job_sector",
          "label": "Industry",
          "type": "select",
          "options": [
            { "id": "Technology & Engineering", "label": "Technology & Engineering" },
            { "id": "Finance & Banking",        "label": "Finance & Banking" },
            { "id": "Healthcare & Medicine",    "label": "Healthcare & Medicine" },
            { "id": "Legal & Compliance",       "label": "Legal & Compliance" },
            { "id": "Academic & Research",      "label": "Academic & Research" },
            { "id": "Skilled Trades",           "label": "Skilled Trades" },
            { "id": "Transport & Logistics",    "label": "Transport & Logistics" },
            { "id": "Manufacturing",            "label": "Manufacturing" },
            { "id": "Real Estate",              "label": "Real Estate" },
            { "id": "Creative & Media",         "label": "Creative & Media" },
            { "id": "Other",                    "label": "Other" }
          ],
          "required": true
        },
        {
          "id": "job_title_specific",
          "label": "Current Job Title",
          "type": "text",
          "required": true,
          "placeholder": "e.g. Senior Software Engineer, Operations Manager"
        },
        {
          "id": "employment_type",
          "label": "Employment Type",
          "type": "select",
          "options": [
            { "id": "employed_full_time",  "label": "Employed — Full Time" },
            { "id": "employed_part_time",  "label": "Employed — Part Time" },
            { "id": "self_employed",       "label": "Self-Employed / Freelance" },
            { "id": "business_owner",      "label": "Business Owner" },
            { "id": "contractor",          "label": "Independent Contractor" },
            { "id": "remote_for_foreign",  "label": "Remote Worker for Foreign Company" },
            { "id": "unemployed",          "label": "Currently Not Employed" }
          ],
          "required": true,
          "tooltip": "Employment type significantly affects income stability assessment."
        },
        {
          "id": "employer_name",
          "label": "Employer or Company Name",
          "type": "text",
          "required": false,
          "placeholder": "Leave blank if self-employed or freelance",
          "tooltip": "Used to cross-check against bank statement deposits."
        },
        {
          "id": "experience_years",
          "label": "Total Years of Professional Experience",
          "type": "number",
          "min": 0,
          "required": true
        }
      ]
    },

    // ─── SECTION 4: ORIGIN COUNTRY DOCUMENTS (PRIMARY) ───────────────────────
    {
      "id": "financials_origin",
      "title": "Origin Country Financial Documents",
      "description": "Upload your actual documents. These are the primary source of your financial profile — the AI reads them directly. Self-declared figures below are used only if documents are unclear or incomplete.",
      "variant": "origin",
      "fields": [
        {
          "id": "bank_statements_origin",
          "label": "Bank Statements — Origin Country",
          "subLabel": "Upload 3–6 months of statements from your main bank account. PDF or clear photo. Any language accepted.",
          "type": "file",
          "multiple": true,
          "accept": ["pdf", "jpg", "jpeg", "png"],
          "required": true,
          "forensicScan": true,
          "tooltip": "This is the most important document. The AI extracts your income, balance, and payment patterns directly from the file."
        },
        {
          "id": "asset_evidence",
          "label": "Property or Asset Documents (Optional but Recommended)",
          "subLabel": "Property deed, investment statement, vehicle title, or any proof of asset ownership.",
          "type": "file",
          "multiple": true,
          "accept": ["pdf", "jpg", "jpeg", "png"],
          "required": false,
          "forensicScan": true,
          "tooltip": "A property deed in your origin country is a strong financial signal for destination-country lenders."
        },
        {
          "id": "local_currency",
          "label": "Origin Country Currency",
          "type": "text",
          "required": false,
          "placeholder": "e.g. UAH, INR, BRL — leave blank if unsure",
          "tooltip": "Optional hint to help the AI correctly identify currency in your documents."
        },
        {
          "id": "local_monthly_income",
          "label": "Monthly Income in Origin Currency (Self-Declared Backup)",
          "type": "number",
          "min": 0,
          "required": false,
          "placeholder": "digits only, e.g. 82000 — no commas",
          "tooltip": "Enter digits only (no commas or spaces — type 41000, not 41,000). Used only if your document upload fails or figures are unreadable. The document is always preferred."
        },
        {
          "id": "ann_income_usd",
          "label": "Estimated Annual Income in USD (Self-Declared Backup)",
          "type": "number",
          "min": 0,
          "required": false,
          "placeholder": "e.g. 24000",
          "tooltip": "Your best estimate of annual income converted to USD. Used as a fallback if documents are unavailable."
        },
        {
          "id": "official_income_share",
          "label": "Portion of Income That is Formally Documented (0.0 – 1.0)",
          "type": "number",
          "min": 0,
          "required": false,
          "placeholder": "1.0 = fully documented, 0.5 = half informal",
          "tooltip": "In some countries a portion of income may be informal or cash-based. Be honest — this affects analysis accuracy, not just score."
        }
      ]
    },

    // ─── SECTION 5: LIABILITIES ───────────────────────────────────────────────
    {
      "id": "liabilities",
      "title": "Debts & Payment History",
      "description": "Lenders look at your obligations relative to income. Honest disclosure is more valuable than a clean picture.",
      "fields": [
        {
          "id": "debts_total_origin",
          "label": "Total Outstanding Debts in Origin Country (USD Equivalent)",
          "type": "number",
          "min": 0,
          "required": true,
          "placeholder": "Enter 0 if none",
          "tooltip": "Sum of all loans, credit cards, mortgages, and other obligations."
        },
        {
          "id": "delinq_history",
          "label": "Missed or Late Payments in the Last 24 Months",
          "type": "number",
          "min": 0,
          "required": true,
          "placeholder": "Enter 0 if none",
          "tooltip": "Number of times you missed or were significantly late on a payment. Does not disqualify — context matters."
        },
        {
          "id": "liquid_reserves",
          "label": "Liquid Savings / Investments Available (USD Equivalent)",
          "type": "number",
          "min": 0,
          "required": false,
          "placeholder": "Cash, savings accounts, accessible investments",
          "tooltip": "Shows financial buffer for the transition period."
        }
      ]
    },

    // ─── SECTION 6: LOCAL FINANCIAL HISTORY (OPTIONAL) ───────────────────────
    {
      "id": "financials_destination",
      "title": "Destination Country Financial Records (Optional)",
      "description": "If you already have financial history in the destination country, add it here. Even a few months of local bank statements significantly strengthens your dossier.",
      "variant": "us",
      "fields": [
        {
          "id": "has_us_nexus",
          "label": "I have financial records in the destination country",
          "type": "toggle",
          "required": true,
          "tooltip": "Enable if you have a local bank account, credit card, or any financial activity in the destination country."
        },
        {
          "id": "current_local_address",
          "label": "Current Address in Destination Country",
          "type": "textarea",
          "required_if": { "has_us_nexus": true }
        },
        {
          "id": "us_debts_total",
          "label": "Total Local Liabilities (USD)",
          "type": "number",
          "min": 0,
          "required_if": { "has_us_nexus": true },
          "placeholder": "Enter 0 if none"
        },
        {
          "id": "bank_statements_us",
          "label": "Destination Country Bank Statements",
          "subLabel": "Any recent statements from local bank accounts, even if recently opened.",
          "type": "file",
          "multiple": true,
          "accept": ["pdf", "jpg", "jpeg", "png"],
          "required": false,
          "forensicScan": true
        }
      ]
    },

    // ─── SECTION 7: CONSENT ───────────────────────────────────────────────────
    {
      "id": "consents",
      "title": "Data Use & Consent",
      "description": "Your documents are processed by AI for the sole purpose of generating your financial dossier. They are not stored permanently and are never shared without your explicit action.",
      "fields": [
        {
          "id": "consent_data",
          "label": "I authorise secure AI analysis of my documents and data",
          "subLabel": "I understand my documents will be analysed by AI to generate a cross-border financial profile.",
          "type": "checkbox",
          "required": true
        }
      ]
    }
  ]
};
