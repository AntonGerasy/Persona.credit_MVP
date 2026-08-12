# v35.2.5 — PB1 Reliability Final

Scope: pre-Private-Beta reliability only. Financial engine, TransferScore formula, public-site content, reports, auth model, storage model, and legal pages were not changed.

## Closed
- C019: failed/partial document extraction can no longer silently remove evidence and create a false financial contradiction. Any extraction failure stops the assessment before agents/scoring and returns a retry/session message.
- 401 is surfaced as session-expired; 429 as temporary service-busy; network/5xx as incomplete-processing retry.
- C016 completed: `api/kv.ts` maxDuration now matches the 60-second source-of-truth used by the API.
- Identity review UI no longer displays free-form model reason text; review uses a fixed safe message.
- Added `test:reliability` and made it blocking in `test:pb1` and CI.

## PB1 gate
`npm run test:pb1` must pass before deployment. After deployment run `BASE_URL=https://www.persona.credit npm run test:security:live`.
