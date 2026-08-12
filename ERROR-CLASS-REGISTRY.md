# Persona.credit — Universal Error-Class Registry

The registry names defects by engine behavior, never by a person, country, bank, currency, or literal counterparty. A persona is only a detector for a class.

| ID | Universal class | Status | Guard |
|---|---|---|---|
| C001 | Single-token transaction classification | CLOSED | A payer/country/token cannot decide classification alone; multi-signal golden test |
| C002 | Narrow synthetic-fixture acceptance | CLOSED | Server QA mode + explicit fixture marker |
| C003 | LLM-controlled QA identity reliability | CLOSED | Every accepted QA identity has deterministic reliability 50 |
| C004 | Structured evidence vs narrative divergence | MITIGATED | Narrative must use structured reconciliation; targeted report checks remain |
| C005 | Review-required invisibility | CLOSED | Review rows and count rendered in Dashboard/PDF; golden classifier guard |
| C006 | Unsourced benchmark generation | CLOSED FOR MVP | Exact percentile/median/demand claims suppressed without a source |
| C007 | Decision-state inconsistency | CLOSED | Structured decision precedence; contradiction outranks review fallback |
| C008 | Extractor field-population variance | PERMANENTLY MITIGATED | Unknown/conflicting extraction becomes review_required, never confidently wrong |
| C009 | Economic and identity coupling in final score | ACCEPTED / DOCUMENTED | Economic score is separate; TransferScore intentionally includes identity and confidence |

## Release rule

A new input must resolve to **correct** or **review_required**, never confidently wrong. Any new defect is first classified as either a regression of an existing class or a genuinely new universal class.

## Regression levels

1. **Targeted:** tests for the class changed in the current patch.
2. **Golden smoke:** stable carrier classes run on every version without a live LLM.
3. **Full matrix:** complete regression suite before a release candidate.

Live persona runs are required when extraction prompts or file-processing behavior changes. Deterministic engine changes use golden extraction fixtures first.

| C010 | Full-score pipeline coupling regression | Closed | Golden smoke covers clean verified scoring and material contradiction penalty/decision precedence. |

| C011 | Cross-slot document type acceptance | CLOSED | Identity-slot success requires multiple structured identity signals; financial documents reject; ambiguous inputs never receive green success |

| C012 | Slot compatibility overrides document-validity verdict | CLOSED in v35.2.4 | Identity acceptance is conjunctive: deterministic slot compatibility AND positive validity verdict; handler composition covered by 8/8 slot tests |
| C013 | Strict identity-category false-review risk | OBSERVE IN PB1 | Keep strict boundary for safety; instrument via returned slotCompatibility/documentCategory and relax only if real review rate proves material |
| C014 | Identity-slot guard outside CI/type gate | CLOSED in v35.2.4 | `test:slot` is blocking CI; `api/` and tests have dedicated blocking server typecheck |
| C015 | Legacy client TypeScript debt breaks CI signal | MITIGATED / DEBT | PB1 gate no longer depends on pre-existing client type debt; legacy `npm run lint` remains visible as non-blocking CI until cleaned |
| C016 | Conflicting serverless duration sources | CLOSED in v35.2.5 | AI functions and `api/kv.ts` use a single 60s Vercel function duration consistent with module exports |
| C017 | Review state not surfaced distinctly in upload UI | OPEN P3 | Safe behavior remains non-green; improve UX after PB1 unless real users show material confusion |
| C018 | Paid AI endpoints callable without session/rate limit | CLOSED in v35.2.4 | All paid AI endpoints require live server session and per-session endpoint quota; live security test asserts anonymous 401 |

| C019 | Infrastructure failure becomes a financial verdict | CLOSED in v35.2.5 | Any document-extraction failure blocks agents/scoring; incomplete evidence never produces CONTRADICTED or any TransferScore |

| C020 | Server-side module resolution outside the function directory | CLOSED in v35.2.7 | Blocking `check-api-bundle` rejects relative imports from `api/*.ts` that escape `api/` or do not resolve |
