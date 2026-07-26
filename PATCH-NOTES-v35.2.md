# v35.2 — Provider Acceptance RC

Financial classification, reconciliation, contradiction, and scoring algorithms remain feature-frozen.

## Provider-facing changes
- Shared reports now display explicit `Material Evidence Conflict` and `Manual Review Required` recipient signals.
- The shared-report score visualization now uses the actual 0–1000 scale.
- Unsupported income percentiles are no longer shown in the shared report; the report states that no dated external benchmark is attached.
- `Document-Verified` is replaced with the narrower `Evidence Reconciled` wording.
- PDF and dashboard narratives no longer use `Prime`, `superior resilience`, or similar marketing-style underwriting language.
- Added an automated provider-acceptance check covering shared report, dashboard, PDF, landing disclaimer, and legal surfaces.
