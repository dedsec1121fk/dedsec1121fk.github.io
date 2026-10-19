> **Historical checkpoint, not the current offline release procedure.** The current downloadable ZIP is validated entirely offline. Use `Documentation/OFFLINE_QUALITY_REPORT.json` and `Documentation/OFFLINE_CURATION_MANIFEST.json` for the current counts, redirects, pass results and limitations. This ZIP does not modify GitHub or production.

# Knowledge editorial validation — 18 October 2026

This checkpoint triggers one controlled staging workflow run after batching editorial changes.
It does not authorize production deployment.

## Included in this run
- Twelve hand-authored source-specific English/Greek lessons replace generic exercise sheets, with code, expected behavior, failure boundaries, and explicit execution limitations.
- Conservative removal of identifiable filler, empty section headings, and exact repeated long paragraphs without rewriting unrelated source or inventing filler.
- Existing bilingual ID/path checks, source-to-Markdown parity, browser regression and strict editorial release gate.

## Completion rule
A green GitHub Pages deploy means staging works, **not** that the knowledge base has been fully edited.
The editorial gate MUST report PASS before claiming that the educational corpus is finished.
If incomplete, preserve the exact remaining counts and examples. Never weaken criteria or add generic padding merely to obtain green status.

## Actions budget
The user has allocated 200 GitHub Actions minutes. Batch in-place changes with [skip ci], and do not run the full workflow for each individual lesson. Production remains unchanged.
