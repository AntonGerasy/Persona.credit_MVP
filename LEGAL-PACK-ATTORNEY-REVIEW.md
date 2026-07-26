# Persona.credit — Legal Pack (DRAFTS for attorney review)

> ⚠️ **NOT LEGAL ADVICE.** These are professionally structured drafts to accelerate your lawyer's work, not final documents. Every `[BRACKET]` is a fact only you/your counsel can fill. The FCRA/ECOA section (Part E) flags a structural question that must be answered by a US attorney **before US launch**. Do not publish any of this without review by qualified counsel in each jurisdiction you operate in (company seat + user locations).

**Fill-in variables used throughout:**
`[LEGAL ENTITY]` (registered company name) · `[JURISDICTION]` (country/state of incorporation) · `[REG. ADDRESS]` · `[SITE]` = www.persona.credit · `[DPO EMAIL]` = compliance@persona.credit · `[SUPPORT EMAIL]` = support@persona.credit · `[HOSTING]` (e.g. Vercel + region) · `[LLM PROVIDER]` (e.g. Google Gemini API) · `[DB/STORAGE PROVIDER]` · `[DATA RETENTION PERIOD]` · `[EFFECTIVE DATE]`.

---

# PART A — PRIVACY POLICY (draft)

**Effective date:** `[EFFECTIVE DATE]`
**Controller:** `[LEGAL ENTITY]`, `[REG. ADDRESS]`. Contact: `[DPO EMAIL]`.

## 1. Who we are and scope
Persona.credit ("we", "us") operates `[SITE]`, a service that analyses user-submitted financial and identity documents to produce a cross-border financial-evidence summary ("Report"). This Policy explains what personal data we process, why, on what legal basis, and your rights. It applies to visitors, registered users, and recipients of shared Reports.

## 2. What data we process
- **Account data:** email, authentication identifiers, account settings.
- **Documents you upload:** bank statements, identity documents, and their contents (name, date of birth, document number, account numbers, transactions, balances, employer/payer names). These may include, depending on the document, **special-category / sensitive data** (e.g. data revealing identity-document numbers, and in some documents nationality). We ask you not to upload data you are not authorised to submit.
- **Derived analysis:** extracted fields, computed income/obligations, scores, and Report text.
- **Technical data:** IP address, device/browser, timestamps, logs.
- **Support data:** correspondence you send us.

## 3. Why we process it and legal basis (GDPR Art. 6 / Art. 9 where applicable)
| Purpose | Legal basis |
|---|---|
| Provide the Report you request | Performance of a contract (Art. 6(1)(b)) |
| Process identity/financial documents incl. sensitive data | Your **explicit consent** (Art. 9(2)(a)); withdrawable anytime |
| Security, fraud prevention, service integrity | Legitimate interests (Art. 6(1)(f)) |
| Legal/regulatory compliance | Legal obligation (Art. 6(1)(c)) |
| Product improvement (aggregated/de-identified only) | Legitimate interests; no sensitive data used |

We rely on **explicit consent** for processing document contents; you give it via the consent checkbox at intake and can withdraw it (see §9), which stops further processing and lets you delete your data.

## 4. Automated processing / AI
Reports are generated with automated analysis, including a third-party large-language-model API (`[LLM PROVIDER]`) used to extract fields from your documents. **The Report is decision-support evidence, not an automated decision that produces legal effects by itself** — Persona.credit does not approve or deny credit, housing, or employment. Any lending/rental decision is made by the third party you choose to share with. Where automated processing with legal/similarly significant effect applies (GDPR Art. 22), you have the right to human review — contact `[DPO EMAIL]`.

## 5. Sub-processors / who we share with
- **`[LLM PROVIDER]`** — document text sent for extraction. `[Confirm data-use terms: no training on your data; enterprise/zero-retention tier if available.]`
- **`[HOSTING]`**, **`[DB/STORAGE PROVIDER]`** — hosting and storage.
- **Recipients you choose:** when you generate a share link or send a Report, the recipient receives its contents. You control this.
- We **do not sell** personal data. Full sub-processor list: `[LINK]`.

## 6. International transfers
Data may be processed in `[LIST COUNTRIES/REGIONS]`. Where data leaves the EEA/UK, we rely on `[Standard Contractual Clauses / adequacy decision — confirm with counsel]`.

## 7. Retention
Documents and derived data are retained for `[DATA RETENTION PERIOD]` or until you delete them, whichever is earlier. On account deletion we delete or de-identify personal data within `[N]` days, except where retention is legally required. `[Confirm actual retention behaviour matches this — see engineering note in Part F.]`

## 8. Security
We use `[encryption in transit (TLS); encryption at rest; access controls; logging]`. No method is 100% secure. Report share links: `[describe — e.g. unguessable token, optional expiry; see Part F P0 items]`.

## 9. Your rights
Depending on your location (GDPR/UK GDPR, CCPA/CPRA, and others) you may have rights to: access, rectification, **erasure**, restriction, portability, objection, and to **withdraw consent**. Exercise them via `[DPO EMAIL]`. You may also complain to your data-protection authority. **We do not discriminate** against you for exercising CCPA rights.

## 10. Children
The Service is not for anyone under 18. We do not knowingly process data of minors. `[Confirm — see age gate in Part F.]`

## 11. Changes & contact
We will post changes here with a new effective date. Questions: `[DPO EMAIL]` · `[SUPPORT EMAIL]` · `[REG. ADDRESS]`.

---

# PART B — TERMS OF SERVICE (draft)

**Effective date:** `[EFFECTIVE DATE]` · **Provider:** `[LEGAL ENTITY]`

## 1. Agreement
By using `[SITE]` you agree to these Terms. If you don't agree, don't use the Service.

## 2. What the Service is — and is NOT
Persona.credit produces a **cross-border financial-evidence summary** from documents you submit. **It is NOT:** a credit bureau or consumer reporting agency service; a credit score; a FICO score; a lending, tenancy, or employment decision; financial, legal, or immigration advice; a guarantee of any outcome. The Report is **informational decision-support only**. Any decision based on it is made solely by the recipient.

## 3. Eligibility & accounts
You must be 18+ and able to form a binding contract. You are responsible for your account and for the accuracy and lawfulness of documents you upload. **You represent that you are authorised to submit every document and that its data relates to you or to a person who has authorised you.**

## 4. Acceptable use
No unlawful use; no uploading of forged, altered, or third-party documents without authorisation; no attempts to reverse-engineer, overload, or bypass security or QA controls; no use to make decisions that violate anti-discrimination law.

## 5. Accuracy / no warranty on outputs
The Report depends on the quality and authenticity of your documents and on automated extraction, which **may contain errors or require manual review**. We provide the Service "AS IS" and "AS AVAILABLE" and disclaim, to the maximum extent permitted by law, all warranties (merchantability, fitness for a particular purpose, accuracy, non-infringement). You are responsible for reviewing the Report before relying on or sharing it.

## 6. Sharing
If you share a Report (link or send), you are responsible for who you share it with. Recipients see its contents. We are not responsible for recipients' use.

## 7. Fees
`[If applicable: pricing, billing, refunds. If free beta: state "free during Beta; we may introduce fees with notice."]`

## 8. Intellectual property
We own the Service, software, models integration, and Report format/templates. You own your documents; you grant us a limited licence to process them solely to provide the Service. `[Confirm IP ownership language with counsel — relevant to your patent strategy.]`

## 9. Limitation of liability
To the maximum extent permitted by law, `[LEGAL ENTITY]` is not liable for indirect, incidental, special, consequential, or punitive damages, or for decisions made by any Report recipient. Our aggregate liability will not exceed `[the greater of amounts you paid in the prior 12 months or USD 100]`. `[Some consumer-protection regimes limit these caps — confirm.]`

## 10. Indemnity
You indemnify us against claims arising from your unlawful use or from documents you were not authorised to submit.

## 11. Termination
You may delete your account anytime (§ account settings). We may suspend/terminate for breach.

## 12. Governing law & disputes
Governed by the laws of `[JURISDICTION]`. Disputes: `[courts / arbitration — confirm; note consumer arbitration rules vary]`.

## 13. Changes
We may update these Terms with notice via `[SITE]`/email. Contact: `[SUPPORT EMAIL]`.

---

# PART C — DISCLAIMERS (place on every surface)

**C1 — Global footer (site, dashboard, landing):**
> Persona.credit provides an informational cross-border financial-evidence summary. It is **not a credit bureau report, not a credit score, not a FICO score, and not a lending, tenancy, or employment decision**. It does not constitute financial, legal, or immigration advice. Any decision remains solely with the recipient.

**C2 — PDF report footer (already present — keep, and align wording):**
> This report is for informational purposes only, does not constitute a credit bureau record, and is not equivalent to FICO or any consumer credit score. Not a consumer report under applicable law. `[Confirm final wording with counsel.]`

**C3 — Share-link recipient banner (top of any shared Report):**
> You are viewing an informational financial-evidence summary shared with you by an individual. It is **not a credit report or credit score** and must not be used as the sole basis for any credit, housing, or employment decision. Independent verification is recommended.

**C4 — Intake consent (at document upload — must be explicit, unbundled):**
> ☐ I confirm I am authorised to submit these documents, that the data relates to me or to someone who authorised me, and I **explicitly consent** to Persona.credit processing my financial and identity documents (including sensitive data) to generate my Report, as described in the Privacy Policy. I understand I can withdraw consent and delete my data at any time.

**C5 — QA / synthetic mode (must never appear in production; internal guard):**
> SYNTHETIC QA FIXTURE — NOT FOR REAL-WORLD USE. `[Engineering: assert QA mode is OFF in production; see Part F P0-C.]`

**C6 — "What this means for the lender" sections:** avoid imperative advice ("lender should…"). Prefer neutral: *"The following is context a recipient may consider; it is not a recommendation or an assessment of creditworthiness."* `[FCRA-sensitive — see Part E.]`

---

# PART D — EMAIL / CONTACT SETUP

- **`[SUPPORT EMAIL]` (support@persona.credit):** product/account help; account & document deletion requests; general questions. Target response `[e.g. 2 business days]`.
- **`[DPO EMAIL]` (compliance@persona.credit):** privacy/data-protection requests (access, erasure, consent withdrawal, Art. 22 human review), legal/regulatory, law-enforcement, and dispute/accuracy complaints. Target response `[e.g. within statutory deadline, max 30 days GDPR]`.
- Publish both in Privacy Policy, Terms, site footer, and share-recipient banner.
- `[Set up real inboxes/aliases + a logging process for rights requests — regulators expect a working channel, not a decorative address.]`

---

# PART E — FCRA / ECOA MEMO (⚠️ resolve with US counsel BEFORE US launch)

**This is the single most important legal question for the product, not a formatting task.**

## E1 — Are you a Consumer Reporting Agency (CRA) under FCRA?
FCRA can apply when a business **assembles or evaluates consumer information to furnish "consumer reports" to third parties** for decisions about **credit, housing, employment, insurance**. Two facts push Persona.credit toward CRA status:
1. Reports are **shared with third parties** (banks, landlords) — the product is literally built for cross-border lending/rental context.
2. Reports **evaluate financial standing** (income verification, contradiction flags, a score).

**Labelling the output "not a credit bureau report" does NOT, by itself, avoid FCRA.** Courts look at function, not the disclaimer. If you are a CRA, obligations are heavy: maximum-possible-accuracy procedures, permissible-purpose controls, consumer dispute/reinvestigation process, adverse-action support, and more.

**Mitigating design choices to discuss with counsel (do not treat as sufficient on your own):**
- Position the Report as delivered **to the consumer**, who then chooses to share it — a consumer-facing tool, not a furnisher-to-lender pipeline. (This helps but is **not** a guaranteed carve-out; the sharing feature complicates it.)
- Avoid making or implying the **decision** or a creditworthiness verdict; keep outputs to verification of documents the user supplied.
- Remove imperative "lender should…" language (see C6).
- Consider gating any lender-direct delivery feature until FCRA posture is cleared.

## E2 — ECOA / Reg B
ECOA prohibits discrimination in credit and governs adverse-action notices. If your outputs are used by creditors, and especially if you ever move toward scoring that could correlate with protected classes (national origin is central to a **cross-border** product), get counsel review of:
- disparate-impact exposure of scoring factors (country, currency, "migration resilience");
- whether any adverse-action notice duties flow to you or stay with the lender.

## E3 — Other regimes to check with counsel
- **EU/UK:** GDPR (done in Part A), plus if outputs influence credit decisions, automated-decision rules (Art. 22) and consumer-credit directives.
- **US state law:** CCPA/CPRA (California), plus state consumer-reporting analogues.
- **Marketing claims:** avoid "verified", "prime", "certified" unless defensible (FTC/UDAP exposure). Your team already removed "Prime US credit profile" language — keep that discipline.

**Bottom line for the owner:** before US public launch, a US attorney must answer *"Are we a CRA, and if so what must change?"* This may affect the **sharing feature** and the **score presentation** — i.e. it can touch the (now frozen) engine's outputs. Flag it to GPT 5.6 sol as a **P0 that may require an engine-output change**, not just copy.

---

# PART F — ENGINEERING NOTES for GPT 5.6 sol (so legal text matches reality)

These make the documents *true* — a privacy policy that describes behaviour the code doesn't do is itself a liability.

- **P0-C QA guard:** hard-assert `PERSONA_QA_FIXTURE_MODE` and client QA mode are OFF in production; synthetic IDs must be **rejected** on `[SITE]`, never accepted as fixture. Add a startup check that refuses to boot prod with QA on.
- **Deletion actually deletes:** implement account + document deletion that removes data from DB **and** storage **and** any LLM-provider retention (`[confirm provider retention/zero-retention]`), within the window stated in Privacy §7.
- **Share-link isolation:** unguessable token, `noindex`, optional expiry/revoke; verify a link can't be enumerated and isn't cached publicly.
- **Consent is real + unbundled:** the C4 checkbox must be logged (timestamp + version) and required before processing; withdrawal must stop processing.
- **Age gate:** enforce 18+ per Terms §3 / Privacy §10.
- **Data-flow accuracy:** confirm the sub-processor list (Part A §5) matches actual calls (LLM provider, hosting, storage), incl. regions, so international-transfer wording is correct.
- **Disclaimer surfaces:** wire C1/C3 into UI + share view (C2 already in PDF).

---

## How to use this pack
1. Fill every `[BRACKET]` with your real facts.
2. Have counsel review — **especially Part E** — for each jurisdiction you'll serve.
3. Give Parts C, D, F to GPT 5.6 sol for v35.0 (they're implementation-ready copy + engineering requirements).
4. Keep Parts A, B as your lawyer's starting draft, not final text.
