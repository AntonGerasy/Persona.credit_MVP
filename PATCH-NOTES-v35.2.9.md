# v35.2.9 — Document Processing Reliability RC

Scope is intentionally limited to the pre-PB1 extraction reliability classes C021–C024. Financial scoring rules, reconciliation, document-slot validation, reports, landing, legal, provider experience and storage are unchanged.

## Closed / guarded

- **C021 — HTTP-200 processing failure:** extraction fallbacks now carry `processing_failed: true`; the client treats them exactly like infrastructure failures and C019 blocks the financial verdict.
- **C022 — technical failure ≠ authenticity concern:** technical exceptions never populate `authenticity_concerns`.
- **C023 — ambiguous self-transfer wording:** a self-transfer marker plus a named external legal entity goes to `review_required`, not confident exclusion.
- **C024 — universal long-document extraction:** every PDF uses fixed two-page windows orchestrated by the client. Chunks are assembled deterministically without content-based deduplication; statement control totals are reconciled when the source provides them. Any failed chunk or failed control reconciliation becomes RETRY, never PARTIAL. Single images remain one chunk.

## Regression assets

`qa-personas/P8-long-document/` contains the synthetic 12-page / 698-transaction Cyrillic fixture and generator. CI regression tests use synthetic chunk JSON only; the PDF is for explicit live QA.

## Acceptance invariant

For every accepted document: **COMPLETE or RETRY, never PARTIAL.** A technical processing failure must never become missing evidence, an authenticity accusation, or an adverse financial signal.
