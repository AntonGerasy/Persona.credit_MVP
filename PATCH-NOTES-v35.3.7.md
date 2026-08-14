# PersonaCredit v35.3.7 — Private Beta Release Candidate

Closed-scope final patch before Private Beta.

## Functional fix
- An incoming credit left `review_required` by the deterministic income audit is treated as unresolved evidence, never proof that the applicant contradicted their declared income.
- Such cases resolve to `partial`, preserve both declared and observed figures, and explain that the remaining difference is unresolved.
- The income contradiction channel is forced to `0` while unresolved income evidence exists.
- The displayed discrepancy percentage is suppressed for unresolved/partial evidence.

## Reproducibility
- Confidence-only score inputs (`overall_confidence`, `evidence_strength`, `overall_uncertainty`) are quantized to 5-point steps before TransferScore calculation. Pillar values, weights, formula, transaction rules and evidence factor logic are unchanged.

## UI clarity
- TransferScore gauge uses dark text on the light dashboard surface.
- Per-document `Fidelity` is renamed `Document Read Fidelity` to distinguish extraction quality from identity verification.
- Model-written claims of strong/confirmed identity verification are removed from Strengths unless deterministic `identity_document_status === 'passed'`.

## Explicitly unchanged
No bank-, country-, currency-, payer-, applicant- or document-specific branches were added. Extraction, international date parsing, transaction classification, score weights, auth, storage, provider flow, legal pages and public landing content are unchanged.
