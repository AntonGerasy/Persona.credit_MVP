# v34.29.3 Build Hotfix

- Corrected the Dashboard import path for `RealmSwitcher` from `./components/RealmSwitcher` to `../components/RealmSwitcher`.
- Re-ran a static relative-import resolution scan across `src/` and `api/`; no unresolved local imports remain.
- Retains the object-spread syntax fixes from v34.29.2.
