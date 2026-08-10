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
