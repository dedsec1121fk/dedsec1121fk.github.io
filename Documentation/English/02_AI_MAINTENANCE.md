# AI-assisted maintenance protocol

## Authorized scope
Operate only on `dedsec1121fk/Test` unless the owner expressly approves work in a production repository. Never change the private source repository, GitHub Pages DNS or CNAME by inference. Never claim browser or Android testing without performing it.

## Evidence-first workflow
1. Read the current Git tree SHA, `README.md`, these maintenance guides, `index.html`, `assets/ui.js`, `assets/ui.css`, importer, and workflow. Use file contents rather than historical guesses.
2. Inventory complete filenames and records before editing; do not infer the presence of missing pages or binaries.
3. State expected invariants: bilingual labels, unique destinations/ids, 6 landscape/desktop and 3 portrait columns, two themes, fixed minimal header, footers, Easter egg, no forbidden deploy files, offline archive.
4. Patch the smallest set of files; retain original education, published DedSec authorship, licensing, attribution and external-link boundaries.
5. Use a local syntax check and the `scripts/validate.py` structural validator. Add focused regression tests for changes. HTML regex validation is not a substitute for rendering on actual devices.
6. Prefer one integrated commit and a single Pages workflow run; the owner's GitHub Actions minutes are limited to 200 available minutes for this project.
7. Inspect the exact commit hash and Actions outcome and distinguish pushed, deployed and browser-tested states in the final report.

## Non-negotiable safety and quality
No secret tokens, private profile data, passwords, public write backdoors or dangerous credential harvesting. Do not remove licensing or attribution. Preserve authorized educational cybersecurity context. Do not duplicate the same lessons, source text or menu entries merely to increase quantity. Preserve offline reading and responsive usability.

## Repository retirement gate
Before deleting Developer-Mind-Project: migrate complete original Markdown corpus, documentation, scripts and license files; reconcile paths, count and hashes; confirm no runtime dependency; verify a fresh clone of Test contains everything; request explicit user approval to delete afterward. Never delete automatically.


### Current October 2026 layout and preservation note
Portrait mobile uses **three** full-title launchers per row; every landscape and desktop uses **six**. The Black/White butterfly tracks theme in root and imported pages; both include a Search icon. The canonical `assets/galaxy.css` provides locally stored stars and a dim overlay; imported-page wrappers are transparent with translucent reading panels. Original DedSec pages are preserved under `dedsec/`, while source Markdown from Developer Mind still needs a separate provenance migration before any deletion. Full workflow: [09_COMPLETE_MAINTENANCE.md](09_COMPLETE_MAINTENANCE.md).
