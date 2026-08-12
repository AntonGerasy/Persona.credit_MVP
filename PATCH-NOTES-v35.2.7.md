# v35.2.7 — C020 Serverless Bundle Hotfix

- Moved server-only shared modules into `api/_lib/` without changing module contents.
- Updated API, client, and test imports to the new single source of truth.
- Removed the old root `shared/` directory.
- Added blocking `test:api-bundle` to reject top-level API relative imports that escape `api/` or do not resolve.
- Added the bundle guard to `test:pb1` and GitHub CI.
- Updated server typecheck scope and C020/testing documentation.
- No scoring, classification, reconciliation, report, public-site, legal, or provider behavior changes.
