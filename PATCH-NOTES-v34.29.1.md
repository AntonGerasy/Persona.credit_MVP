# Persona.Credit v34.29 Public Release Candidate

- Added required government-ID upload field and identity verification status separation.
- Removed all FICO-equivalent and Prime-tier claims; TransferScore now displays on a 0–1000 proprietary scale.
- Hardened Latin merchant marker matching to avoid Hema/Hemant substring collisions.
- Hardened bilingual name reconciliation against one-token, extra-token, order, and model No-match upgrades.
- Preserved agent uncertainty and flags large confidence/uncertainty mismatches instead of suppressing risk.
- Added deterministic sector contradiction post-processing.
- Corrected obligations/repayment language surfaces, PPP fallback, negative zero, duplicate punctuation/status labels.
- Conservative fraud-risk fallback when the fraud node is absent.
- Added identity document to extraction pipeline.

Release requires a fresh user run followed by explicit regression and auth/data-isolation test authorization.

## v34.29.1 hotfix
- Fixed Dashboard.tsx object spread syntax at line 471 (`{ ...(rawData || {}) }`).
- No functional logic changes.

## v34.29.2 hotfix
- Fixed a second malformed object spread in Dashboard.tsx share-link persistence (`{ ...data, ownerEmail: userId }`).
- No functional logic changes.
