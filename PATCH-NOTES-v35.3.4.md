# PersonaCredit v35.3.4 — Universal Evidence Eligibility + Numeric Date Order Final RC

Scope is intentionally closed to two production defects observed in the v35.3.3 live run. No scoring, reconciliation thresholds, UI, auth, storage, provider flow, security, landing, or bank/country-specific analytics were changed.

## 1. Readable bank evidence remains usable

A bank/account statement that produced a deterministic income or obligations audit is retained as usable financial evidence when processing did not fail and extraction is not unreadable. A model-level `is_usable=false` can no longer discard successfully transcribed evidence because the financial pattern is irregular, non-payroll, low-balance, weak, or otherwise imperfect.

The rule is based on document type + deterministic audit availability + extraction status. It does not inspect bank name, applicant, country, currency, income amount, payer identity, or score. Any stale model `rejection_reason` is cleared when deterministic evidence proves the document readable.

## 2. Numeric date order is inferred from the document itself

Numeric dates are no longer globally assumed day-first. The document is inspected for unambiguous rows:

- `27/04/26` proves day-first.
- `04/27/26` proves month-first.
- ambiguous rows such as `05/01/26` inherit the document-level order.

The same inferred order is reused by reliable-period derivation, income month grouping, and obligations month grouping. There are no country or bank branches.

## 3. Activity-span divisor

A statement that crosses a calendar boundary is normalized by its actual dated activity span, not the count of calendar labels. Example: Apr 14–May 11 is one month of activity, not two. This keeps Bank-of-America-style monthly statements from being divided by two merely because they cross month-end.

The existing detached-year outlier guard remains intact. A ~6-month statement remains ~6 months; a genuine long statement remains long.

## Regression coverage added

- readable bank statement + model rejection + deterministic transcript => retained as usable evidence and rejection reason cleared;
- month-first `04/27/26 + 05/01/26` => Apr–May, one month of activity, obligations divisor = 1;
- day-first `27/04/26 + 01/05/26` => Apr–May, one month of activity;
- pre-existing universal guards remain unchanged.

## Cross-country design note

The implementation remains evidence-driven rather than geography-driven. Existing synthetic/QA experience includes ISO-style statements used for Nigerian and Brazilian personas, CJK year-month-day support, localized month names, Cyrillic transaction semantics, Vietnamese markers, and multilingual refund/obligation markers. v35.3.4 adds no institution-specific or nationality-specific classification path.

## Acceptance target after deployment

1. Origin-country bank statement remains in income basis and is not `UNUSABLE` when transactions were deterministically read.
2. Source institution is not `N/A — no income documents` when such evidence exists.
3. Documented origin income remains present downstream.
4. US-style monthly statement covering Apr 14–May 11 is labeled Apr–May, not January.
5. Its monthly obligations remain USD 1,218, not USD 609.
6. Contradiction penalty is expected to remain 0 when partial extraction already suppresses contradiction.
