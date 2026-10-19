# Human maintenance handbook

## Day-to-day edits
1. Work exclusively on the Test repo. Check `git status` and create a backup commit before structural changes.
2. To change desktop titles, edit the five-field `APPS` array in `assets/ui.js`: English title, Greek title, sprite key, destination, navigation kind. Keep all labels fully spelled out; the filename extension can be .py, .sh, .md or .txt.
3. To add a launcher, verify a unique target and both localizations; add a corresponding icon definition if needed. DedSec launcher group goes before educational group. Sponsor Us uses `https://github.com/sponsors/dedsec1121fk`.
4. To update the header, modify `index.html` AND `scripts/import_dedsec.py`'s imported header template, so every imported page matches. The navbar contains only the logo/title, Search, theme and language controls.
5. For visual changes, edit `assets/ui.css` for main site and `dedsec/Assets/merged-retro.css` for original HTML content; check both dark and light themes.
6. If editing an imported page directly, understand it may be overwritten when the importer marker version changes. Upstream canonical edits belong in the original DedSec source, or in an explicitly documented Test-only override.
7. For new educational lessons, update the authoritative Markdown source first, then regenerate BOTH language indexes, preserving unique record IDs and translating responsibly.

## Verification matrix
- Desktop widths: narrow Android (~320–430px) exactly 3 columns in portrait; wide desktop (>760px) exactly 6 columns.
- Top bar fixed, only logo/title, theme and language; no burger, bottom taskbar, or nested page scrollbar.
- All shortcut titles complete and readable; link targets resolve under /Test or are explicitly external.
- Both themes: black galaxy in dark, lavender galaxy in light, with readable cards/code/input fields and footer.
- English/Greek: launcher titles, navigation feedback, and correct destination for DedSec imported pages; no bookmark or preference storage exists.
- Open Tools, Installation, FAQ and Assistance in both languages, including long tables, code samples, collapsible FAQ and footer.
- Search English and Greek errors, reverse engineering, code and methods; try offline refresh on localhost and after cloning.
- Tap logo/title 7 times and restore without reloading.

## Common failures
- 404 imported link: recalculate relative URL based on each HTML file's directory depth.
- Incorrect theme inside a guide: ensure imported page loads shared retro CSS after legacy styles and shared retro JS.
- Old navbar/footer visible: remove old markup during import; check multiple nav/footer copies aren't reintroduced.
- Search empty: check `data/*.js` load order and the first `window.ARCHIVE_...` assignment; no fetch is performed.
- Deployment skipped: inspect `on.push.branches`, Pages settings and Actions validation steps, not only the GitHub green check.


### Current October 2026 layout and preservation note
Portrait mobile uses **three** full-title launchers per row; every landscape and desktop uses **six**. The Black/White butterfly tracks theme in root and imported pages; both include a Search icon. The canonical `assets/galaxy.css` provides locally stored stars and a dim overlay; imported-page wrappers are transparent with translucent reading panels. Original DedSec pages are preserved under `dedsec/`, while source Markdown from Developer Mind still needs a separate provenance migration before any deletion. Full workflow: [09_COMPLETE_MAINTENANCE.md](09_COMPLETE_MAINTENANCE.md).
