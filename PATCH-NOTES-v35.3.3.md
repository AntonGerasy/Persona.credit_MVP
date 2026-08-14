# v35.3.3 — Beta Period Outlier Guard Final

## Scope
One targeted, universal correction after independent review of v35.3.2.

- `deriveReliablePeriod` now trims only detached **edge** calendar months separated from the rest of the observed statement coverage by more than six months.
- The displayed `startMonth` / `endMonth` are derived from the same trimmed window used for the normalization divisor.
- Internal sparse coverage and legitimate long statements are preserved.
- No bank-, country-, person-, currency-, or filename-specific branches were added.
- Financial scoring, reconciliation, UI, auth, storage, provider flows, and public pages are unchanged.

This closes the single failing v35.3.2 regression guard where one plausible OCR year outlier produced 7 months instead of the correct 6.
