# Persona.Credit v34.27 — Stability UX Patch

Base: v34.26 design build.

Changed only:
- `src/App.tsx`
- `src/pages/PricingPage.tsx`
- `src/pages/Dashboard.tsx`
- `src/lib/pdfGenerator.ts`
- `src/types.ts`

Implemented:
1. Paid pricing storefront remains visible. Selecting either plan reveals an Early Access surprise: the selected plan is activated free, with no card or payment collection.
2. Unknown countries no longer display default PPP x1.00 or inflation 0.0%. Dashboard and PDF state that the benchmark is unavailable.
3. Reports with no usable uploaded documents use `Not Verified` and neutral assessment wording instead of implying documentary verification.
4. Signed-in users with an existing report receive a confirmation before starting a new report. Existing reports remain in History and the current report is not deleted.

Not modified:
- document extraction
- AI agents/prompts
- income or obligation engines
- scoring or reconciliation
- authentication
- KV/storage architecture
- history behavior
- sharing/revocation
- provider functionality
- dashboard calculations beyond benchmark display guard

Validation performed:
- archive/directory diff reviewed;
- delimiter counts balanced in all changed TypeScript/TSX files;
- pricing and modal handlers inspected;
- `npm install` timed out in the working container, so Vite/TypeScript build must be confirmed by Vercel.
