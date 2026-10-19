# Build, deployment and recovery

## Offline preview
Clone or extract the Test repo. Open `index.html` directly in a browser or run `python3 -m http.server 8765` from the repository root and visit `http://127.0.0.1:8765/`. On Termux use the installed `python` executable. No npm build, paid host or cloud API is required for the archive.

## Importer and deployment
The Pages workflow verifies files, optionally clones the publicly accessible DedSec website when its import marker changes, adapts links and styles, commits the resulting `dedsec/` copies to Test, then uploads a static Pages artifact. `dedsec/.full-import-ready` is the import marker; GalaxyV3 means the current visual integration. Do not delete this file merely to force unnecessary redeployment. The workflow's GITHUB_TOKEN commit may not create a second run, so examine the deployed artifact from the same run.

## Scope and exclusions
Only Test is modified. Forbid files whose name starts with `sitemap` or `llms`, and `CNAME`; do not include a custom domain configuration. Do not silently publish this experimental integration as the production DedSec website.

## Rollback
Identify the last good SHA in the GitHub commit history and reverse your changes in a new commit rather than force pushing or rewriting history. Run validation; inspect Pages output; compare source paths and sample pages. For local backup, zip the repository excluding `.git`, after confirming both language indexes and the imported pages exist.

## Browser release smoke test
Validate home dark/light, logo and translation controls, 3/6 grid, title Easter egg, external GitHub Sponsor link, actual Greek and English article URLs, search, the absence of bookmark controls and persistent preferences, reader code scrolling and footer. Document any untested platforms.


### Current October 2026 layout and preservation note
Portrait mobile uses **three** full-title launchers per row; every landscape and desktop uses **six**. The Black/White butterfly tracks theme in root and imported pages; both include a Search icon. The canonical `assets/galaxy.css` provides locally stored stars and a dim overlay; imported-page wrappers are transparent with translucent reading panels. Original DedSec pages are preserved under `dedsec/`, while source Markdown from Developer Mind still needs a separate provenance migration before any deletion. Full workflow: [09_COMPLETE_MAINTENANCE.md](09_COMPLETE_MAINTENANCE.md).
