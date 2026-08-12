# Persona.credit v35.2.4 — PB1 Safety RC

This release is a pre-Private-Beta safety hardening patch. It does not change the frozen financial scoring/classification engine or the public-site content introduced in v35.2.3.

## Closed

- **C012 / P0:** identity-slot compatibility can no longer overwrite a negative validity verdict. A green identity result now requires BOTH compatible identity structure and a positive validity result. Expired, illegible, tampered, specimen/synthetic, name-mismatch, or otherwise model-rejected identity evidence cannot become green merely because its document structure resembles an ID.
- Handler composition moved into shared production logic (`resolveIdentityValidation`) and is covered by production-code regression guards.
- Identity slot suite expanded from 4 to **8 guards**.
- `test:slot` is now a blocking CI step.
- Added dedicated blocking server typecheck for `api/`, `shared/`, and tests.
- Existing legacy client TypeScript debt is explicitly non-blocking/informational rather than silently making the CI safety job permanently red.
- Removed conflicting 10s Vercel duration for paid AI routes; AI routes now match their 60s serverless configuration.
- **C018:** paid Gemini-backed endpoints require a valid current PersonaCredit session and apply a per-session/per-endpoint fixed-window quota. Anonymous callers receive 401 before invoking Gemini.
- Live lifecycle test now verifies anonymous rejection on all four paid AI endpoints.

## Deliberately unchanged

- Financial engine, TransferScore formula, contradiction rules, transaction classifier, review-required engine.
- Dashboard/report/provider logic.
- Public landing, TransferScore communication, Founding 200, Privacy and Terms.
- Strict ambiguous-ID behavior (C013): remains fail-safe/review and will be relaxed only if PB1 data demonstrates excessive false review.
- Review-vs-reject upload UX distinction (C017): safe but deferred P3 UX improvement.

## PB1 gate

`npm run test:pb1` must pass, followed by production `npm run test:security:live` and the three manual identity uploads documented in TESTING-STRATEGY.md.
