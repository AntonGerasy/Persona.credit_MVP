# Persona.credit v34.32 — Universal Consistency RC

- Safe word-boundary matching for refund/rebate/reversal markers; CJK markers retain direct matching.
- Verified income with a 0% reconciliation gap no longer receives an income contradiction penalty.
- Missing uncertainty is derived from confidence rather than defaulting to 50%; mismatch warnings require an explicit model value.
- One confidence value is used for display and scoring.
- Dashboard and PDF use aligned score-pillar terminology.
- PDF no longer shows an Income Pattern for identity documents.
- PDF consistency section consumes the same uncertainty concerns as the dashboard.
- Removed Prime/FICO-equivalence and regulatory-clearance language from the web certificate.
- QA fixture behavior remains unchanged: accepted only when both QA flags are enabled, and never treated as identity-verified.
