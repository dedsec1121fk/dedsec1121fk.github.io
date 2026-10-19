# Curated offline knowledge archive — October 2026

## What changed and why

The previous catalogue contained 1,188 records in each language, with hundreds of extremely short Markdown lessons and repeated template paragraphs. Merely adding the same checklist to every page would not teach a subject. This offline edition **consolidates** related material into topical guides instead of inflating text or silently removing unrelated concepts. It retains 669 indexed records in English and 669 in Greek: **422 Markdown guides plus 247 original source/reference files per language**. The independent Hacking Guide (140 chapters per language), Termux troubleshooting, and 30 reasoning records are outside those 634 indexed records and remain present.

The 559 original record paths removed from each locale were not simply thrown away. The consolidation uses existing explanations, exercises, code and technical notes to build subject-level chapters. `Documentation/OFFLINE_CURATION_MANIFEST.json` maps old Markdown paths to their retained destination. A small set of old repetitive generator warnings was removed, not copied into a new place. The user-facing index, extracted Markdown files and offline website share the same final text.

## Content maintenance rules

1. Keep English and Greek as matching **topics**, not matching numeric suffixes; original import IDs were assigned in different orders.
2. Add a new subject-specific explanation with executable *illustrative* code, assumptions, a failure boundary and actual expected behavior. Never duplicate paragraphs simply to meet a length target.
3. The canonical published text is in `DedSec-Project-Website/data/en.js` and `el.js`, with its matching Markdown under `Developer's Mind/Keep Programming Alive/English` or `Greek`. The checked-in source is already packaged: do not download or import from another repository.
4. Preserve referenced `.py`, `.sh`, `.txt`, `.js` and other learning files. When moving a chapter, update the original-path redirects in the curation manifest and fix its relative Markdown links.
5. Keep the Hacking Guide attribution, permissions, privacy and existing site visual rules. Do not change production domains or credentials.
6. Do not rerun the one-time consolidator on the already curated archive. Its guard refuses the second run deliberately. Use regular edits and the parity audits instead.

## Checks available without GitHub Actions

From the extracted root, run `python3 scripts/audit_knowledge.py`, `python3 scripts/audit_knowledge_depth.py --strict`, `python3 scripts/audit_offline_links.py`, `python3 scripts/validate.py`, and `python3 -m unittest discover -s scripts -p 'test_knowledge_*.py'`. The optional `scripts/offline_browser_smoke.py` requires Chromium and Python Playwright in a machine that permits local browser navigation. You can serve the static site with `python3 -m http.server 8765 --bind 127.0.0.1` from the extracted root, then browse `/DedSec-Project-Website/index.html`. On Termux, use the supported Python package from Termux and the same local URL; the website does not need a server-side database.

## What was actually tested

The language/parity audit, duplicate/empty-section checks, website static checks and relative Markdown links passed locally. All **24 English practical-script `.py` examples** were executed in a disposable Linux working directory and passed; see `Documentation/EXECUTED_PYTHON_SAMPLES.json`. Browser navigation was blocked by the processing environment's administrator, so a complete mobile/desktop Chromium rendering check was **not** claimed. The other language runtimes (especially historical or commercial compilers), Android/Termux behavior and independent line-by-line technical peer review were not exhaustively tested.

## Release and Actions policy

This ZIP is self-contained. **No GitHub repository or Actions run was used to create it.** The bundled workflow checks the curated sources as-is; it does not re-run legacy padding scripts, auto-delete lessons, or commit generated files to main. If you choose to upload it to a test repository later, only that upload and its ordinary repository settings can trigger a new build. Do not treat a green deploy alone as proof of a full independent content review.

## Topic correction / scope

The curated catalogue contains focused Clojure, Unicode, Git, process-concurrency, environment-configuration and threat-model guides. Misplaced source sections were moved, not discarded. The original paths and updated destinations are recorded in `Documentation/OFFLINE_CURATION_MANIFEST.json` under `topic_relocations`. Some deliberately named collections still group several related labs; the card titles reflect their actual scope. The archive has not been deployed to the live website.

## Visual testing boundary

Chromium executed the archived homepage as inline HTML/CSS/JS at 390×844 and 1280×800, with both requested locales. Theme/language changes, cookie choice and Unicode search responded without JavaScript page errors or horizontal overflow. URL navigation on file:// and localhost HTTP was blocked by the execution environment, so this is a **partial** browser smoke test, not a full website, font/image, or real-device certification. Details: `Documentation/INLINE_BROWSER_TEST.json`.
