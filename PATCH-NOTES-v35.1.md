# Persona.credit v35.1 — Provider Experience & Release Polish RC

## Scope
No scoring, classification, reconciliation, contradiction, or TransferScore algorithm changes.

## Changes
- Added public `/privacy` and `/terms` legal surfaces with Persona.credit disclaimers and working mailto contacts.
- Added the disclaimer to the landing page, authentication page, and shared-report recipient view.
- Added provider-facing narrative normalization so factor values are not collapsed into one misleading number.
- Internal QA-only notes such as synthetic fixture/fabricated-data markers are filtered from provider-facing evidence notes and underwriting considerations.
- Replaced raw `[*] Document Notes` rendering with clean `Evidence Review Notes` for genuine review issues.
- Account deletion now returns deletion evidence for the stored user/report/document record, history records, and revoked share links.
- Live security test now defaults to production URL and explicitly verifies record/history deletion.

## Freeze statement
The Financial Engine remains feature-frozen. This release changes presentation, legal surfaces, and lifecycle verification only.
