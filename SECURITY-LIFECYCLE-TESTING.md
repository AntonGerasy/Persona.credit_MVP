# v35.0 — Security & Lifecycle acceptance test

This is one automated live test against the deployed site. It creates two temporary accounts, checks isolation/ownership/session revocation/share security/concurrency, and deletes the temporary accounts at the end.

## Run

```bash
BASE_URL=https://www.persona.credit npm run test:security:live
```

## PASS means

- production QA fixture mode is disabled;
- server storage is connected;
- signup/login/session work;
- user A cannot read user B data, and vice versa;
- share links are owner-stamped, non-cacheable and noindex;
- another user cannot overwrite or revoke a report link;
- parallel assessments remain separate;
- password change revokes the old session;
- account deletion removes login, user data, history and share links.

## Manual check still required

Open `https://www.persona.credit/api/production-readiness` and confirm:

```json
{"environment":"production","qaFixtureMode":"disabled","storageConfigured":true,"safeForRealUsers":true}
```

Do not upload a real identity document for this security test.
