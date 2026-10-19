# Curated knowledge — editorial release gate

**Current offline-package status:** the machine-checkable strict content gate passes in both English and Greek, including no under-depth indexed Markdown, empty sections, long exact repeated paragraphs, or recognized synthetic investigation padding. The archive/website body comparison and source-code links pass as well. Original imported IDs differ in order between locales; pairing is based on the topic and filename rather than numeric UI IDs.

## Required re-checks before deployment

- `python3 scripts/audit_knowledge.py` — exact bodies, source files, ID uniqueness and bilingual counts.
- `python3 scripts/audit_knowledge_depth.py --strict` — topic parity, 1,500-character depth floor, repeated paragraphs, empty sections, filler and Markdown/code fences.
- `python3 scripts/audit_offline_links.py` — relative links inside the offline source archive.
- `python3 -m unittest discover -s scripts -p 'test_knowledge_*.py'` — source-specific regression checks.
- `python3 scripts/validate.py` — static website links, assets, menus and required documentation.
- `node scripts/browser_audit.mjs` in a configured Chromium/Playwright host — independent UI checks before releasing live changes.

## Honest limits of these audits

A document being 1,500 characters long does **not** mean it is accurate, complete, safely executable or independently reviewed. Some original short articles have been consolidated with related materials, not invented anew. Selected Python examples were actually executed; the remaining compilers and mobile versions were not exhaustively exercised. See `English/16_CURATED_OFFLINE_KNOWLEDGE.md` and `Greek/16_ΕΠΙΜΕΛΗΜΕΝΗ_OFFLINE_ΓΝΩΣΗ.md` for scope, limitations and update rules.

This ZIP is a staging deliverable. It does not modify the production domain or production project.
