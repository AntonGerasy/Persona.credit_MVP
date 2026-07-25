# Release Checklist v34.26 — final regression before public launch

Run against the deployed release candidate (Build Cache OFF). Environment
errors (KV/network/Gemini quota) = INVALID: fix the environment and repeat
the step — not a failure of the build.

## 0. Preconditions
- [ ] Vercel env has GEMINI_API_KEY and ADMIN_EMAIL; KV is connected.
- [ ] Gemini billing active (Tier 1), Prepay balance above zero.
- [ ] Vercel Web Analytics enabled for the project (dashboard side).

## 1. Four-persona engine regression (anchors)
- [ ] Rahul (IN→US): 75,000 INR/mo, Regular; self-IMPS + interest excluded.
- [ ] María (MX→US): 31,000 MXN/mo; TRASPASO excluded.
- [ ] Chen Wei (CN→US): 25,150 CNY/mo; obligations ≈ 10,613; 餐饮 not counted.
- [ ] Hoa (VN→CANADA): 30,000,000 VND/mo; obligations 15,230,000; CAD-calibrated
      dossier; Vietnamese names clean in the PDF.

## 2. Applicant flow
- [ ] Start New keeps the previous report until the new run completes;
      Continue to Dashboard never a silent no-op.
- [ ] Industry AND Current Job Title both optional; a run with both empty
      produces no invented profession ("Sector not stated by applicant" ok).
- [ ] Copy Link → works in incognito; Email to Lender opens the mail app with
      the online link; Revoke → "Report Unavailable"; Copy Link republishes.
- [ ] History accumulates; "% Confidence" labels only.

## 3. Admin traction (v34.20)
- [ ] Admin account: USER REGISTRY opens — counters + user table; View report
      shows score/summary. Non-admin sees no admin block.
- [ ] A deleted account disappears from the registry.

## 4. For Partners showcase (providers backlogged)
- [ ] Page copy targets service providers (lenders/landlords/banks) — no
      influencer/revenue-split remnants.
- [ ] Join Network / Apply → "Partner Onboarding Opens Soon" notice; no
      registration path.

## 5. Auth core
- [ ] Two applicant accounts fully isolated.
- [ ] Password change signs out other devices; old password dead.
- [ ] Delete Account (THROWAWAY account only): wrong password refused; correct
      password wipes account, sessions, report link; email reusable.

## 6. Analytics (v34.21)
- [ ] After deploy, visit a few pages → Vercel → Analytics shows visitors/page
      views within a minute (disable ad-blocker for the check).

## 7. Legal package
- [ ] docs/legal/* handed to counsel (see README-FOR-LAWYER.md); approved
      texts ship later as a content-only patch.

Verdict: PASSED = public launch approved (technically).


## QA fixture safety
- Confirm `PERSONA_QA_FIXTURE_MODE=false` in Production.
- Confirm `VITE_QA_FIXTURE_MODE=false` in Production.
- QA fixture deployments must be visibly separated from public production.
