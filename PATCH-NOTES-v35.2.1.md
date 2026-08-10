# Persona.credit v35.2.1 — Identity Slot Validation Hotfix

## Scope
Targeted production-safety hotfix only. Financial engine, scoring, reports, auth, storage, security lifecycle, provider acceptance, Privacy and Terms are unchanged.

## C011 — Cross-slot document type acceptance

- The Identity Document upload field no longer accepts a bank statement or other financial evidence as a green valid identity upload.
- Gemini now returns structured document-category and structural signals.
- A deterministic server-side compatibility guard decides whether the Identity slot is compatible.
- Identity acceptance requires multiple independent identity signals (identity category, credential structure, issuing authority, holder identity).
- Financial-document structure produces a hard wrong-slot rejection.
- Unknown/conflicting classification does not receive green success.
- Identity validation is fail-safe when the validation API/key is unavailable; unrelated financial upload behavior is unchanged.
- QA synthetic-ID bypass remains server-gated and applies only to the Identity Document slot.

## Regression guards
- bank statement + applicant name -> Identity slot REJECT
- genuine government identity structure -> ACCEPT
- ambiguous/insufficient identity structure -> REVIEW (not green success)
- existing financial engine golden guards remain unchanged
