# Build, verify and release Test

Run from the repository root with Python 3.10+ and Node 24 (the account test uses `node:sqlite`). Use an isolated Python environment with `mistune==3.2.0`; the regular build does not require BeautifulSoup or sponsor-packaging cryptography. Linux shell examples follow. On Windows use `py -3`/`python` and `.venv\Scripts\python.exe`; on Termux use its Python/Node packages. Real Android performance still needs a device check.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install mistune==3.2.0
python3 scripts/build_site_search.py
python3 scripts/build_site_search.py --check
python3 scripts/validate.py
python3 scripts/audit_knowledge.py
python3 scripts/audit_knowledge_depth.py --strict
python3 scripts/audit_offline_links.py
python3 scripts/audit_near_duplicates.py
python3 scripts/audit_complete_catalogue.py
python3 -m unittest discover -s scripts -p 'test_*.py'
node scripts/test_account_core.cjs
node scripts/test_account_service.mjs
node scripts/test_knowledge_renderer.mjs
node scripts/test_knowledge_search.mjs
node scripts/test_search_passages.mjs
node scripts/test_save_links.cjs
node scripts/test_offline_worker.mjs
python3 scripts/verify_reviewed_examples.py
.venv/bin/python scripts/build_portable_site.py --target test --output .site-publish
python3 scripts/test_portable_site.py --output .site-publish
python3 scripts/audit_publication.py --output .site-publish --report publication-audit.json
```

Generated search is committed with changed source. Build output, virtual environments and local reports are not authored source; keep them out of the commit. To inspect the publication, run `python3 -m http.server 8765 --directory .site-publish` and open `http://127.0.0.1:8765/`. Use HTTP instead of opening `file://`, because browser fetch, workers and module behavior differ.

For the exact browser harness, serve the **repository root** instead (same port, separate server session), leave `.site-publish` in place, install `playwright-core@1.58.2` under `/tmp/dedsec-browser`, and provide a Chromium executable through `CHROME_PATH` if it is not in one of the script's standard paths. Run `node scripts/browser_audit.mjs`. The absolute temporary dependency path is currently part of that harness. Windows users can run the exact harness in WSL or CI; do not claim it ran merely because static checks passed. Inspect `browser-screenshots/` and the audit result. Mock account tests do not contact a real user email or defeat CAPTCHA.

`.github/workflows/static.yml` performs the checks, installs its Markdown/browser dependencies, builds with `--target auto`, uploads browser evidence and publishes Pages only when `github.repository == 'dedsec1121fk/Test'` and prior steps pass. It does not clone upstream source or commit generated changes. Unknown automatic profiles fail closed. Other profiles in the builder exist for separately authorized releases; do not use them for this task.

Commit once after local checks, preserve the parent SHA, and inspect that exact push run. A browser failure prevents Pages deployment. Check `deployment-manifest.json`, Test noindex/robots, both account page languages, relative assets, search destinations, loader, themes and footer after successful deployment. The static workflow does **not** deploy `account-service/worker.mjs`; follow the private account runbook separately. Live registration, email ownership and reward eligibility require live checks in addition to fixtures.

Roll back public behavior with a normal revert commit and rebuild from source. For the Worker, retain a known previous version and its matching catalogue/secrets. Keep D1 backups before migration. Do not blindly run an old Worker that inserts positional rows against a newer schema; see the migration compatibility warning in chapter 21.
