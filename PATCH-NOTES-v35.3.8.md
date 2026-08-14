# v35.3.8 — Private Beta Final Ordering Fix

Scope: one reconciliation-order correction only.

- `unresolvedIncomeEvidence` now intercepts only the final `contradicted` branch.
- A profile whose documented income otherwise verifies the declaration (`ratio >= 0.85`) remains `verified` even if an unrelated incoming credit is still under manual review.
- A profile with materially low documented coverage and unresolved incoming credit remains `partial`, never `contradicted`.
- No scoring formula, weights, extraction rules, transaction classification, country/bank/name rules, PDF logic, auth, storage, provider flow, or public UI were changed.

Acceptance remains: for the current control case, reconciliation `partial`, contradiction penalty 0, no significant-contradiction wording, and TransferScore spread <=10 across two identical runs.
