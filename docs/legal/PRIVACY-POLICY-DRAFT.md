# Privacy Policy — DRAFT FOR ATTORNEY REVIEW

> **STATUS: DRAFT. Not legal advice, not published. Prepared by the product
> team as source material for licensed counsel. Facts below are verified
> against the v34.17 codebase; bracketed items [LAWYER: …] need counsel input.**

_Last updated: [DATE]_

## 1. Who we are

Persona.Credit ("we") operates a cross-border financial verification tool at
persona.credit. It helps applicants present their home-country financial
history to landlords, banks, and other recipients in a destination country.
[LAWYER: insert legal entity name, jurisdiction, registered address, contact.]

## 2. What we collect

- **Account data:** email address and a password. Passwords are stored only as
  bcrypt hashes on our server; we never store or see plaintext passwords.
- **Application data you enter:** name, date of birth, citizenship, destination
  country, application purpose, and financial details you choose to provide.
- **Documents you upload:** bank statements and similar financial documents.
  These are transmitted to our AI processor for analysis (see §4). Extracted
  results (income figures, transaction summaries, generated report) are stored;
  we do not maintain a separate long-term archive of the raw files themselves.
  [LAWYER: verify phrasing versus transient processing copies at Google/Vercel.]
- **Generated outputs:** your TransferScore, dossier text, report and analysis
  history (up to 20 past assessments).
- **Technical data:** session tokens (random identifiers), basic logs from our
  hosting provider. We do not run advertising trackers.

## 3. How we use it

Solely to (a) authenticate you, (b) produce your verification report, (c) let
you share that report with recipients you choose, and (d) operate and secure
the service. We do not sell personal data. [LAWYER: confirm "do not sell/share"
language vs CCPA/CPRA definitions.]

## 4. Processors and sub-processors

- **Google (Gemini API):** uploaded documents and application data are sent to
  Google's Gemini API for AI analysis. [LAWYER: reference Google's API data-use
  terms; paid-tier data handling.]
- **Vercel:** hosting and serverless functions; **Vercel KV (Upstash Redis):**
  encrypted-in-transit storage of account records, reports, and sessions.

## 5. Sharing you control

- **Share links:** when you use "Email to Lender" or "Copy Link", your report is
  published at an unguessable URL (`/report/PC-…`). **Anyone who has that exact
  link can view that report without logging in.** You choose when to create it
  and whom to send it to. [LAWYER: adequacy of link-based consent model;
  revocation — see §8 open items.]
- **Provider sharing:** if you explicitly share your dossier with a listed
  provider, a snapshot of your score and dossier is made visible to that
  provider.

## 6. Retention

- Account and report data: stored with a rolling 90-day expiry, refreshed on
  activity.
- Sessions: 30 days, revoked on password change.
- Assessment history: latest 20 entries.
[LAWYER: confirm retention statement format and any statutory minimums.]

## 7. Security

Server-side password hashing (bcrypt), opaque session tokens, per-account
storage isolation enforced server-side, HTTPS throughout, API keys held only in
server environment. No system is perfectly secure; [LAWYER: standard breach
notification clause per applicable law.]

## 8. Your rights

Access, correction, deletion. Currently deletion is fulfilled manually via
[SUPPORT EMAIL]. [LAWYER + PRODUCT OPEN ITEMS: (1) self-serve deletion is not
yet built; (2) published share links currently have no revocation UI — a
manual support process must be stated; (3) GDPR/UK GDPR lawful basis mapping,
data-subject request SLA; (4) CCPA notice at collection; (5) international
transfer mechanism for Google/Vercel processing.]

## 9. Age

The service is for adults 18+. We do not knowingly process minors' data.

## 10. Changes and contact

[LAWYER: change-notice mechanism.] Contact: [SUPPORT EMAIL].
