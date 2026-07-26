# Testing strategy — simple operating procedure

## On every code version

1. Run `npm run test:smoke`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Manually test only the class changed in this version.

## Before a Release Candidate

Run the full regression suite, then security and lifecycle checks in the fixed readiness order.

## When a live persona is needed

Use a live document/persona only when:
- the extraction prompt changed;
- OCR/file parsing changed;
- a genuinely new document structure is being tested;
- the golden fixture cannot reproduce the suspected extraction issue.

Do not rerun every historical persona after a presentation-only change. Golden fixtures protect the deterministic engine from cross-class regressions.

## What golden smoke does — and does not — prove

Golden smoke validates the deterministic engine against saved structured inputs. It covers transaction classification, identity/decision rules, and the full score pipeline.

It does **not** prove that a live LLM will extract every PDF field correctly. Extraction remains probabilistic. Use a live document run only when the extraction prompt, OCR/file parsing, or a genuinely new document structure changes. The safety target for extraction variance is: **correct or review_required, never confidently wrong**.
