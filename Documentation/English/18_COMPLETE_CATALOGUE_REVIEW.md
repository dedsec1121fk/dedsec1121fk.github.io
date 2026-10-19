# Complete catalogue review and ongoing verification

This review applies to Test. It changes source content and validation; it does not publish to the main or backup repositories.

## What was actually checked

The effective website contains 1,740 records, 870 per language, including 1,234 Markdown lessons. The audit now reads every catalogue: the two programming indexes, methods, introductory security lessons, the full Hacking Guide, effective Termux replacements and deep dives. Replacement records are applied before counting; a source and its replacement are one displayed lesson.

The original narrower checks covered 1,368 records and did not reject repetitions within a single page. The broader review found 66 repeated-prose groups with 1,144 occurrences. After removing redundant boilerplate and revising the affected content, 52 original occurrences remain, each in a distinct group; 1,092 original occurrences were removed or rewritten. No substantive repeated-prose group remains under the current normalization and 100-character threshold. Code listings and brief headings are excluded from this prose comparison.

All 1,234 effective Markdown lessons are also compared using four-word shingles. The 0.72 similarity threshold is an editorial signal, not a claim of complete semantic uniqueness. Repeated ideas phrased differently can still require human judgment.

## Specific editorial changes

Twelve technical topic pairs were expanded or rewritten: storage errors; DNS/TLS; Linux permissions; Git recovery; proot boundaries; Windows command resolution; Bash filenames; SQLite migrations; binary header validation; ELF/PE inspection; Linux x86-64 assembly; and MATLAB matrix operations. The two beginner-project collection guides were rewritten to describe the actual bundled scripts and clearly separate proposed extensions from existing capabilities. The 36 previously short deep-dive notes were also expanded with concrete fixtures, decision rules and failure cases, producing 62 revised English/Greek guides alongside the wider boilerplate cleanup.

Storage diagnosis distinguishes ENOSPC, EDQUOT, EROFS and access errors. Proxy diagnostics no longer print credential-bearing environment values. A strict binary parser rejects malformed lengths and UTF-8. The SQLite example now tests schema rollback, not just a failed row update. NASM and MATLAB explanations use one worked program each instead of repeating a generic starter listing.

Placeholder references were repaired, and 122 historical Hacking Guide module links were converted to existing lesson IDs. Shared-study links lead to the existing authorized-lab guide. Stable IDs were retained; the original Hacking Guide source attribution remains in its records. Content was editorially adapted, so it should not be described as an unchanged upstream copy.

## Reader, previews and themes

The offline reader now handles backtick and tilde fences by delimiter type and length, escapes code/HTML, supports internal lesson links and displays technical tables. Source-reference records display as code. Every effective record receives a generated preview: 1,740 pages, rather than previews for only the two programming indexes. Preview pages inherit the saved light/dark preference and have their own theme control.

The browser suite checks the existing 179 imported pages in both palettes, plus mobile/desktop code rendering and generated preview behavior. Its artifacts distinguish computed-style checks and screenshots from physical-device testing. A local Chromium download was unavailable in this environment; the GitHub-hosted suite is the runtime verification path. Consult the latest run for its actual outcome rather than treating the presence of a test as proof it passed.

## Local reproduction

Run `python3 scripts/audit_complete_catalogue.py`, `python3 scripts/audit_knowledge_depth.py --strict`, `python3 scripts/audit_near_duplicates.py`, `python3 scripts/audit_offline_links.py`, `python3 -m unittest discover -s scripts -p 'test_*.py'`, `node scripts/test_knowledge_renderer.mjs`, `python3 scripts/verify_reviewed_examples.py` and `python3 scripts/validate.py`.

The reviewed-example runner executes 22 Python/Bash snippets and 48 practical scripts, using temporary directories. Python syntax checking covered 142 source files. The renderer checks nine adverse/format cases and 904 effective fenced lessons. Build with mistune installed, then run the portability audit against each output. Main and backup builds are local checks only.

## Limits that must remain visible

Automated audits do not independently establish every technical explanation's accuracy. This pass manually developed the listed topic pairs; it was not a line-by-line expert review of all 1,740 records. Full Windows, Android hardware, MATLAB, NASM and every specialist compiler/runtime have not been executed here. Keep examples labeled with their prerequisites and distinguish predicted output from measured results. Do not pad a lesson or weaken a check to obtain a green result.
