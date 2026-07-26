# v34.36 — Universal Regression Infrastructure RC

This release changes the testing process rather than adding applicant-specific logic.

- Added the universal error-class registry (C001–C009).
- Added deterministic golden smoke tests that run without a live LLM.
- Added guards for single-token classification, genuine refund exclusion, visible review fallback, self-transfer exclusion, deterministic QA identity reliability, and contradiction precedence.
- Extracted structured decision and QA identity rules into reusable pure functions used by the product and tests.
- Added a three-level regression strategy: targeted, golden smoke, full matrix.
- Added CI workflow for smoke, TypeScript lint, and production build.

No person, country, bank, currency, or literal payer is special-cased.
