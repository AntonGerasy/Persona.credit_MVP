# PersonaCredit v35.3.9 — Homepage Conversion Redesign

Scope: **public homepage only**. No changes to extraction, deterministic rules, scoring, prompts, authentication, reports, dashboards, profiles, storage, API behavior, or backend logic.

## Homepage changes
- Reframed hero around the primary product outcome: foreign financial documents → one clear U.S.-ready financial report.
- Kept “Alternative to the outdated credit scoring comes now” as a secondary brand statement.
- Added primary `Create My Report — Free` and public `See a Sample Report` paths above the fold.
- Added immediate privacy/trust reassurance beside the first CTA.
- Rebuilt How It Works as a three-step flow.
- Added “This is what PersonaCredit creates” product-output section.
- Added synthetic/demo PersonaCredit product visuals from China, India and Vietnam test personas; no real-user data is used.
- Elevated country financial context as a core differentiator.
- Demoted TransferScore from “the product” to one report output.
- Expanded concrete use cases: housing, banking/lending, auto, insurance, utilities/mobile, professional/relocation.
- Added “Built for consistency — not AI guesswork” explanation without exposing proprietary rules.
- Rebuilt Security/Data Protection section around user control and actual document-handling behavior.
- Renamed public partner block to The Founding 50 while preserving the existing partner route.
- Added lightweight homepage conversion events through `window.dataLayer` for homepage view, hero CTA, sample report, security section and Founding 50 clicks.
- Added compressed WebP demo screenshots and lazy-loading for below-the-fold visuals.

## Explicitly unchanged
- `src/App.tsx` application pipeline
- `src/scoreEngine.ts`
- `api/*` processing endpoints and live prompts
- logged-in dashboard/report UI
- authentication/onboarding behavior
- data model/storage/sharing logic

## Source baseline
Built directly on `persona-credit-MVP-v35.3.8-PRIVATE-BETA-FINAL`.
