# v34.37 — Full-Score Regression Guard RC

## Purpose
Close the remaining regression-infrastructure gap without changing production scoring behavior.

## Changes
- Golden smoke now imports and executes the production `calculateTransferScore` function.
- Added a clean verified-evidence guard: zero contradiction must produce zero contradiction penalty and preserve a healthy score.
- Added a material contradiction guard: the penalty must apply and `CONTRADICTED` must outrank `review_required`.
- Documented the boundary between deterministic smoke tests and probabilistic live extraction.
- Added C010 Full-score pipeline coupling regression to the error-class registry.

## Testing process
- Run golden smoke on every version.
- Run live documents only when extraction/OCR changes or a new document class is introduced.
- Run the full matrix only before the final release candidate.
