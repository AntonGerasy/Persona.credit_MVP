# v35.0 — Security & Lifecycle RC

Financial engine remains feature-frozen. No scoring, classification, reconciliation or contradiction logic changed.

## P0 controls
- Production build fails if `VITE_QA_FIXTURE_MODE=true`.
- Production document validation refuses to operate if `PERSONA_QA_FIXTURE_MODE=true`.
- `/api/production-readiness` exposes non-secret deployment safety status.
- Public report reads send `no-store` and `noindex` headers.
- Share records support explicit `expiresAt` / `revoked` enforcement in addition to KV TTL.
- Global baseline security headers added.
- Automated deployed security/lifecycle test added for auth, session revocation, isolation, ownership, share isolation, parallel assessments and deletion.
