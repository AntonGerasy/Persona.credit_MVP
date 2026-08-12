# Testing strategy — PB1 operating procedure

## Blocking gate on every code version

1. `npm run test:smoke` — deterministic financial/decision engine regression (currently 13 universal guards).
2. `npm run test:slot` — identity-slot + validity composition regression (8 guards).
3. `npm run test:reliability` — extraction-completeness/C019 guard (5 guards).
4. `npm run typecheck:server` — blocking typecheck for `api/`, `shared/`, and tests.
5. `npm run build` — production bundle.

GitHub Actions runs the same five checks. Legacy client `npm run lint` remains visible as an informational, non-blocking debt item until its pre-existing type errors are cleaned; it is not represented as a green safety proof.

## Live security gate before PB1

Run `npm run test:security:live` against the deployed production candidate. It covers auth/session isolation, ownership, share links, deletion/lifecycle, concurrency, production QA guard, and anonymous rejection of paid AI endpoints.

## Manual identity hotfix check

Only four live uploads are required for C011/C012:
- bank statement in Identity Document slot → reject;
- real valid government ID → accept;
- synthetic/specimen identity on production → must not accept.
- known QA fixture identity on production → reject; never “QA fixture accepted”.

## When a live persona is needed

Use a live document/persona only when:
- the extraction prompt changed;
- OCR/file parsing changed;
- a genuinely new document structure is being tested;
- the golden fixture cannot reproduce the suspected extraction issue.

Do not rerun every historical persona after a presentation-only change. The safety target remains: **correct or review_required, never confidently wrong**.
