# Provider Acceptance — v35.2

## Automated check
Run:

```bash
npm run test:provider
```

Expected result:

```text
Provider acceptance check: PASSED (10/10)
```

## Live acceptance walkthrough
After production deployment:
1. Open the landing page and confirm the informational disclaimer is visible in the footer.
2. Open `/privacy` and `/terms` and confirm both pages load.
3. Open one existing shared report.
4. Confirm the top recipient disclaimer is visible.
5. Confirm no percentile claim, `Prime`, `fabricated data`, `synthetic specimen`, or `[*]` appears.
6. Confirm a contradicted report shows `Material Evidence Conflict`; a review case shows `Manual Review Required`.

This walkthrough validates the provider-facing layer only. It does not rerun the frozen financial engine.
