# PersonaCredit v35.3.6 — Private Beta Final Runtime-Prompt Hotfix

One surgical runtime correction only.

- The existing partial-evidence HARD RULE is now present in the live inline Fraud-agent prompt in `api/run-agent.ts`, immediately after `Missing docs ≠ fraud.`
- When `income_gap_reportable === false`, the Fraud agent is explicitly prohibited from presenting declared-vs-observed income differences as a discrepancy, shortfall, inconsistency, or applicant risk; partially read evidence must be treated as a lower bound / evidence limitation.
- The deterministic post-agent filter from v35.3.5 remains unchanged as the independent enforcement layer.

No scoring, reconciliation, extraction, transaction classification, PDF, UI, authentication, storage, provider-flow, country, bank, currency, or applicant-specific logic was changed.
