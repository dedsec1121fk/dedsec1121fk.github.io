# DedSec Project — Test Site Maintenance Map

## Purpose and boundaries
This repository is the private staging integration of the original DedSec website and the Developer Mind bilingual learning archive. Production repositories and custom domains remain unchanged. It is a **static website**, not an executable Python toolkit. `.py`, `.sh`, and `.md` shortcut extensions are thematic UI labels; they open HTML pages and browser-based lessons, not local programs.

## Directory responsibilities
- `index.html`: one fixed header, butterfly logo, one theme button, one language button, desktop container and original-style footer.
- `assets/ui.js`: navigation, 21 unique launchers, app titles and actions, language/theme state, locally searchable read-only lesson records and title-tap collapse.
- `assets/ui.css`: galaxy dark/light themes, six-column desktop and three-column mobile portrait grid, accessible controls, internal reader and main footer.
- `data/en.js`, `data/el.js`, `data/methods.js`: self-contained exported lesson bodies and titles, NOT pointers to the private repo at runtime.
- `dedsec/`: staged copy of original website pages and assets, with adapted paths.
- `dedsec/Assets/merged-retro.css` and `merged-retro.js`: shared themes and navigation behaviour on imported pages.
- `scripts/import_dedsec.py`: public-site importer, only re-runs when its marker version changes.
- `scripts/validate.py`: structural smoke checks.
- `.github/workflows/static.yml`: GitHub Pages validation, one-time import and static deployment.
- `Documentation/Greek/` and `Documentation/English/`: mirrored guidance for maintainers and AI assistants.

## Deployment identity
Never add CNAME, sitemap or llms files to Test. Keep noindex/nofollow metadata. Test links must stay relative to this GitHub Pages project subpath; do not point internal routes at production except explicitly named footer and sponsorship links.

## What this merge does NOT yet replace
The learning index contains complete published lesson text and is usable without Developer Mind online. However, original lesson-by-lesson Markdown source files and non-site scripts from the private Developer-Mind-Project are **not all present** here. Export, verify and commit that entire original source tree before ever deleting that repository. This is a mandatory migration gate, not a future assumption.
\n## Source transfer\nThe optional full-source copier and verifier is `scripts/migrate_developer_mind.py`. Follow [full migration instructions](07_SOURCE_MIGRATION_GATE.md) and do not delete the original repository.\n

### Current October 2026 layout and preservation note
Portrait mobile uses **three** full-title launchers per row; every landscape and desktop uses **six**. The Black/White butterfly tracks theme in root and imported pages; both include a Search icon. The canonical `assets/galaxy.css` provides locally stored stars and a dim overlay; imported-page wrappers are transparent with translucent reading panels. Original DedSec pages are preserved under `dedsec/`, while source Markdown from Developer Mind still needs a separate provenance migration before any deletion. Full workflow: [09_COMPLETE_MAINTENANCE.md](09_COMPLETE_MAINTENANCE.md).


**Update:** Home is the last right-hand navbar button, not a launcher tile. The 22 shortcut labels hide filename suffixes, while guide panels are translucent. See `09_COMPLETE_MAINTENANCE.md` for maintenance.
