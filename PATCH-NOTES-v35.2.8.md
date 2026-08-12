# v35.2.8 — C020 Runtime Resolution Hotfix

Scope: production runtime only. No financial-engine, scoring, report, landing, auth-policy, storage, or AI-behavior changes.

- Fixed Node ESM runtime resolution for server-side utility imports used by `/api/validate-file`, `/api/extract-document`, `/api/run-agent`, and `/api/synthesize` by using explicit `.js` runtime specifiers from TypeScript sources.
- Strengthened `test:api-bundle` so extensionless relative imports from top-level Vercel Functions fail the PB1 gate before deployment.
- C020 remains the same error class: code that compiles locally but cannot resolve a server-side dependency in the deployed function runtime.

Production proof after deployment: unauthenticated POSTs to all four paid-AI endpoints must return HTTP 401, not 500 / FUNCTION_INVOCATION_FAILED.
