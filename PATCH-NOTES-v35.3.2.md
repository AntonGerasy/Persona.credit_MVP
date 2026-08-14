# PersonaCredit v35.3.2 — Beta Semantic Guard RC

Scope: six targeted universal fixes from the independent v35.3.1 review. No bank-, country-, person-, filename-, currency-, or document-specific branches were added.

## Fixed

1. Strong cancellation/reversal semantics outrank merchant repetition. Repeated refunds no longer become `review_required` merely because the same merchant appears many times. Generic refund words retain the more conservative ambiguity path.
2. Credit/debt payment token recognition now covers common semantic abbreviations (`pymt`, `pymnt`, `epay`, `autopay`, etc.) and compound `*card` tokens without introducing issuer/brand lists. Brand-only rows remain a documented limitation.
3. Marker matching in income/obligation classification uses boundary-safe `hasAnyMarker` instead of raw substring matching, preventing false positives such as `rent` inside `current` and `emi` inside `premium`/`remittance`.
4. Recurring-payee fallback rejects high-frequency merchant activity (>3 similar charges per observed month) unless explicit obligation semantics have already matched.
5. Statement-period derivation resists plausible-year OCR outliers by comparing calendar span with occupied months; an isolated old date cannot stretch dense recent coverage across years.
6. The golden card-payment fixture now contains universal debt semantics (`CRD PMT`) rather than requiring recognition from an issuer brand alone.

## Product rule preserved

Real documents are analysed even when evidence is limited. Missing/partial evidence is disclosed, not converted into an accusation against the applicant. These rules operate on transaction semantics and evidence structure, not on Anton's documents or specific banks.

## Known Beta limitation

A debit line containing only an issuer/brand name plus the applicant's name, with no debt/payment semantics, may remain classified as an own-account transfer. No issuer brand allowlist is introduced in this release; this is intentionally deferred to evidence collected during Private Beta.
