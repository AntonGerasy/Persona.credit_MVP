# PersonaCredit v35.3.5 — Private Beta Release Candidate

Closed-scope release with three changes only:

1. Reproducibility: `temperature: 0` and `seed: 42` on extraction, agent, and synthesis Gemini calls.
2. Partial-evidence safety: declared-vs-observed income gaps are not narrated or visualized as applicant discrepancies unless deterministic reconciliation status is `contradicted`; partial evidence remains a lower bound.
3. PDF completeness: extraction coverage is shown next to financial figures and submitted-but-unreadable documents remain visible as excluded from figures.

No bank-, country-, currency-, or applicant-specific decision branches were added.
