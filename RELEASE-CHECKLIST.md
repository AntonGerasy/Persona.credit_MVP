# Release Checklist v34.18 — final regression before public launch

Run against the deployed release candidate (Build Cache OFF). Any order; top to
bottom is easiest. Environment errors (KV/network/Gemini quota) = INVALID: fix
the environment and repeat the step — not a failure of the build.

## 0. Preconditions
- [ ] Vercel env has GEMINI_API_KEY and ADMIN_EMAIL; KV is connected.
- [ ] Gemini billing active (Tier 1), Prepay balance above zero.

## 1. Four-persona engine regression
Upload the same statements as before. Verify the anchor numbers on the
dashboard (Verified Income) and in the dossier:

- [ ] **Rahul (India → US):** income 75,000 INR/mo, Regular; self IMPS transfer
      and bank interest excluded (2 audit entries).
- [ ] **María (Mexico → US):** income 31,000 MXN/mo; TRASPASO ENTRE CUENTAS
      PROPIAS excluded.
- [ ] **Chen Wei (China → US):** income 25,150 CNY/mo; obligations ≈ 10,613
      CNY/mo; the restaurant charge (餐饮) NOT in obligations.
- [ ] **Hoa (Vietnam → CANADA** — deliberately non-US): income 30,000,000
      VND/mo; obligations 15,230,000 VND/mo; "Hoan tra lai hang" NOT excluded
      as interest. Dossier/dashboard calibrated for Canada (CAD context,
      Canadian benchmarks); Vietnamese names render cleanly in the PDF.

## 2. Fixes in this release
- [ ] (FIX-2) On the dashboard: New Assessment → START NEW → leave to the
      landing page WITHOUT finishing → Continue to Dashboard opens the
      PREVIOUS report.
- [ ] (FIX-3) For a fresh account with no reports, Continue to Dashboard leads
      to the application form (never a silent no-op).
- [ ] (FIX-4) Industry field has no red asterisk; Next passes with it empty.
- [ ] (FIX-5) Dashboard menu item is called History (not Integrity Timeline).
- [ ] (FIX-7/8) For Partners → Apply to Join Network opens the "Service
      Provider Portal" (not the applicant one); "Already a partner? Sign in"
      link is present.
- [ ] (v34.16) Copy Link → "Copied ✓" → the link opens the report in incognito
      without login. Email to Lender opens the mail app immediately; the
      message contains "View the report online: …".

## 3. NEW in v34.18 — link revocation & account deletion
- [ ] On the share screen: **Revoke shared link** → styled red confirm →
      the previously working link now shows **"Report Unavailable"** in
      incognito.
- [ ] Press Copy Link again → the SAME link works again in incognito.
- [ ] **Account** button (dashboard header or landing banner) → modal has
      "Delete account permanently…" → with a WRONG password deletion is
      refused; with the correct password on a THROWAWAY test account the
      account is deleted, you land signed-out, and neither the old password
      nor the old report link works anymore. ⚠️ Use a test account — this is
      irreversible.

## 4. Provider flow (first end-to-end pass)
- [ ] Provider signup via the Service Provider Portal (any email, 8+ password).
- [ ] Onboarding/KYB → create a test offer → it appears in the list.
- [ ] Delete the offer → styled "Delete This Offer?" modal with a red Delete.
- [ ] Under an applicant account with a finished report: For Partners → the
      offer is visible; Share dossier → the applicant appears in the
      provider's list with a score.

## 5. Auth core (quick re-check)
- [ ] Two different applicant accounts — no form data crosses between them.
- [ ] Password change → second browser is signed out; the old password fails.
- [ ] History is identical in two browsers (synced from the cloud).

## 6. Content
- [ ] A run with Industry left empty → no invented profession in the dossier
      ("Sector not stated by applicant" is acceptable).
- [ ] Across all dashboard tabs there is no Certainty / Faith /
      "Integrity: %" — only Confidence.

## 7. Legal package (does not block the tech release; blocks the PUBLIC
      announcement)
- [ ] docs/legal/* handed to counsel (see README-FOR-LAWYER.md).
- [ ] After counsel's verdict, final texts go in as a content-only patch
      (no code changes).

Verdict: PASSED = public launch approved (technically). FAILED — send the
list of items with screenshots; fixed as one batch.
