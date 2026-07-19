# Briefing for Counsel — Persona.Credit Legal Package

Cover note for the two draft documents in this folder
(`PRIVACY-POLICY-DRAFT.md`, `TERMS-AND-DISCLAIMERS-DRAFT.md`). Drafts were
prepared by the product team; facts are verified against codebase v34.18.
Nothing here may be published without review by licensed counsel.

## What the product does (30 seconds)

An immigrant/expat uploads bank statements from their country of origin. AI
(Google Gemini) extracts income and obligations, deterministic algorithms
compute a score (TransferScore, up to 850), and an explanatory "dossier" is
generated for a landlord/bank in the destination country. The user can export
a PDF and/or publish the report at a secret link and send it to a recipient.
A second account type — "providers" (landlords/lenders) — publish offers and
receive dossiers that applicants explicitly share with them.

## The main legal risk as we see it

The product is deliberately positioned as an "explanatory document," NOT a
credit report and NOT a credit bureau. Actual recipients may nevertheless use
it in rental/credit decisions. Question #1 for you: are the current
disclaimers sufficient (see Terms §2 and §7), is a RECIPIENT-facing notice
needed on the public report page, and how do we avoid qualification as a
consumer reporting agency (FCRA, US) and analogues elsewhere.

## Technical facts for your assessment (verified against code)

- Passwords: bcrypt hashes only, server-side. Sessions: random tokens, 30
  days, all sessions revoked on password change.
- Storage: Vercel KV (Upstash Redis); account/report records auto-expire
  after 90 days; history keeps the latest 20 assessments.
- Documents: uploaded files are sent to the Google Gemini API for analysis;
  our database stores the extracted results; we keep no long-term archive of
  the raw files (transient processing copies at Google/Vercel — wording
  question for you).
- Sharing: links of the form /report/PC-<random 72 bits>; viewable by anyone
  holding the link, without login. Created only by explicit user action.
  **The user can revoke a published link in the UI at any time** (recipients
  then see "Report Unavailable"); republishing is one click.
- **Self-serve account deletion is implemented**: password-confirmed,
  permanent removal of the auth record, report, share link, history, and
  provider-sharing permissions; all sessions die immediately.
- Age: 18+ product. No ad trackers; data is not sold.

## What we need from you (checklist)

1. Verdict on the "not a credit bureau" positioning + disclaimer wording
   (Terms §2), including a possible recipient-facing notice.
2. Privacy review: lawful bases (GDPR/UK), CCPA/CPRA language, international
   transfer mechanism (Google/Gemini, Vercel/Upstash), retention wording.
3. Data-subject rights: deletion is self-serve (above); confirm the stated
   process and any response-time commitments for other request types.
4. Link-based sharing: adequacy of the consent model given in-UI revocation.
5. Jurisdiction, governing law, legal entity details, contact email — to be
   inserted into both documents.
6. Provider side: whether separate business-account terms are needed.

## Open product items we disclose

- Pricing/refund policy is being finalized — see Terms §5.

Product team contact: [YOUR EMAIL].
