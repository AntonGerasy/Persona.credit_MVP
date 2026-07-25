# Persona.credit v34.31 — Universal Evidence Classification RC

## Core fixes
- Removed broad employer-token exclusion that incorrectly zeroed legitimate self-employed, contractor, founder, and owner salary payments.
- Employer/business overlap is now an audit signal, not proof of self-transfer. Only explicit own-account evidence excludes a credit.
- Added multilingual one-off refund/reversal/tax-refund exclusion markers so isolated non-income credits do not become verified income.
- Partial documentation is no longer treated as a contradiction solely because observed income is below the declared total.
- Reconciliation now records declared documentation share and explains the unverified remainder.
- Identity status is displayed independently from income reconciliation status.
- Added a dual-server/client environment-gated QA fixture path for synthetic identity testing. It is disabled by default and must never be enabled on the public production deployment.

## Generalization rule
No person, bank, filename, employer, or country-specific exception was added. Changes operate on evidence classes and transaction semantics.
