# PersonaCredit v35.3.1 — Beta Arithmetic & Classification RC

Scope: universal corrections discovered by the v35.3.0 real-document run. No bank-, country-, applicant-, or filename-specific branches.

## Critical fixes

1. **Shared document period**
   - OCR dates outside a plausible recent-statement window are rejected as outliers.
   - One document-level period is computed once and reused by both income and obligations engines.
   - Lender-facing period label uses the same deterministic calendar window.

2. **Refund/cancellation credits are not income**
   - Expanded multilingual reversal/cancellation markers, including native-script and defensive transliteration fallbacks.
   - Extraction prompt explicitly preserves transaction descriptions/counterparties in the original script.

3. **Partial extraction cannot become an adverse income discrepancy**
   - When evidence is partial, model-written risk text that frames the observed lower bound as applicant inconsistency is removed.
   - Strengths use deterministic `at least` lower-bound wording.
   - Dossier markdown is re-synchronized after the safety filter.

4. **Recurring merchant purchases vs obligations**
   - Optional MCC is transcribed and common discretionary MCCs prevent ordinary purchases from becoming contractual obligations merely because they recur.
   - Explicit card/loan payment semantics outrank the account-holder-name self-transfer heuristic.

5. **No mixed-currency obligation averaging**
   - The headline local obligations figure is calculated only within the selected reconciliation currency; USD and origin-currency values are never averaged as raw numbers.

## Deliberately deferred for beta

- Perfect payer identity clustering across transliterations (e.g. the same private sender written in two scripts).
- Full untruncated audit display.
- Exhaustive merchant/MCC taxonomy.

These are quality improvements, not blockers for producing a truthful beta report.
