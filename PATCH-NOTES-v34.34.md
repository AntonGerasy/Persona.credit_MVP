# Persona.credit v34.34 — Universal Classification Hardening RC

## Scope
- Universal multi-signal credit classification: no exclusion from one token, payer name, country, or LLM field.
- Ambiguous credits use review-required fallback rather than confident misclassification.
- Deterministic, server-gated QA fixture acceptance propagated from intake to report.
- Separate Economic Evidence Score from Identity Verification Status while retaining both in the overall decision context.
- Behavioral narrative strips internal/debug language.

## Guards
- Genuine refund/reversal context remains excluded.
- Real income contradictions remain contradicted and penalized.
- QA markers are ignored unless PERSONA_QA_FIXTURE_MODE=true on the server.
- Economic Evidence Score is not a replacement for identity verification or the TransferScore.
