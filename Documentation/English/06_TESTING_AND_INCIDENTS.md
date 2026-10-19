# Offline tests, CI, incident handling

## Static CI
GitHub Pages runs `scripts/import_dedsec.py`, `scripts/validate.py`, `node --check assets/ui.js`, and `node --check dedsec/Assets/merged-retro.js`, then commits refreshed imported pages only if they changed. A marker `dedsec/.full-import-ready` stops repeat clones. `GalaxyV3` is the refreshed shared-style template; a marker change causes a deliberate full import and should be rare. The import stage reads a public repository and does not consume secrets or Developer Mind private files.

Checks reject `CNAME`, sitemap and llms files, missing local indexes, duplicate desktop routes, missing footer/shared CSS+JS in any imported HTML, and absent 6/3 layout rules. Workflow output and GitHub Pages artifact must correspond to a known commit. The GitHub Actions minute budget is limited: do not schedule per-file workflows or build redundant runs.

## Manual acceptance checks
Run `python3 scripts/validate.py` after an import, then `python3 -m http.server 8765` in the root. Load the root and one imported English/Greek guide. Test mobile sizes, both themes, long names, image rendering, internal links, Sponsor Us outbound destination, changing language, bookmarks after reload, offline searching, seven-tap collapse and restore. With the network off, all local lesson content and locally hosted articles should still load. External reference sites and sponsors naturally require connectivity.

## If a page looks unthemed
Inspect DevTools Network for `merged-retro.css` and `merged-retro.js`; both must return 200 from the page's correct relative directory. Confirm CSS comes after original `style.css`. If missing, check whether the importer completed and whether `dedsec/.full-import-ready` equals GalaxyV3. Do not append the overlay twice.

## If GitHub deployment fails
Read the first failing step: public clone, data audit, JavaScript parse, git commit, or Pages upload. Repair the underlying issue and commit once; do not trigger repeated builds without inspecting logs. Rollback via a new `git revert` commit if the site is unusable. Never force-push production branches to fix staging UI.