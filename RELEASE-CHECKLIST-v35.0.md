# v35.0 Security & Lifecycle checkpoint

## Already implemented in code
- [x] Server-side authentication and password hashing
- [x] Revocable 30-day sessions
- [x] Password-change session revocation
- [x] Server-enforced per-user data isolation
- [x] Report/share ownership stamping
- [x] Share overwrite/revoke owner enforcement
- [x] Share noindex/no-store controls
- [x] Account, history and share-link deletion
- [x] Production QA hard guard
- [x] Parallel assessment key isolation
- [x] Automated live acceptance script

## Close only after deployed live test
- [ ] Production readiness endpoint returns safeForRealUsers=true
- [ ] Live security/lifecycle script passes
- [ ] Vercel production build passes

## Deferred, not part of this checkpoint
- Email verification and password-reset email require a transactional email provider.
- Legal drafts still require attorney review before publication.
