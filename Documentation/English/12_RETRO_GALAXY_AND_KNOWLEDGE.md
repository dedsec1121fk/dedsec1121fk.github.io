# Retro Galaxy, Accessibility and Knowledge Maintenance

## Design ownership
- `assets/galaxy.css`: shared dark/light galaxy colors, darker dark veil, pale light veil, Tahoma/MS Sans Serif/Arial font preference, and squared corners for HTML controls.
- `assets/starfield-dark.svg` and `assets/starfield-light.svg`: static lightweight nebulae, stars, planets, natural butterflies, two subtle aliens, two dogs and one spacecraft each. Keep SVG assets local; no continuous animation or tracking images.
- `assets/ui.css`: smaller flat launcher icons, centered archive titles/subtitles/lesson text, left-aligned code for readability.
- `dedsec/Assets/merged-retro.css`: historically styled article fixes, consistent black/white text and `#merged-lang` specifically. Its navbar stays opaque to cover scrolled text while article panels remain transparent.

The Windows 95 look uses browser-available font fallbacks, **not** a licensed Microsoft font file. Android may substitute a different typeface. Dark text/glyph target: `#fafafa`; light target: `#111014`. Use `getComputedStyle` on both the element and nested icon/pseudo-element before assuming inherited color.

## Real knowledge, not placeholder duplication
`data/methods.js` now holds 30 unique records, 15 English and 15 Greek, including four new original pieces about computed CSS evidence and knowledge identity. Other source indexes are untouched. `displayTitle(d)` adds a distinguishing source path to generic repeated titles instead of removing SQL samples that happen to share small snippets. Never delete records solely on matching titles or lowercased code; inspect IDs, platform contexts, paths, bodies and actual learning objectives. Do not add generic templated lessons.

Knowledge categories and lessons show centered titles, subtitles, paragraphs and lists, while code remains left-aligned. No bookmarks or Saved Lessons. Theme, language and cookie consent are intentionally persisted.

## Run the audit
1. `python3 scripts/validate.py`, `node --check assets/ui.js`, `node --check data/methods.js`, `node --check scripts/browser_audit.mjs`.
2. GitHub Actions uses headless Chromium with screenshots in artifact `test-chromium-audit`: root, Greek Installation, category and lesson in dark/light modes. Review exact text and glyph computed colors, corners, content alignment and mobile overflow.
3. Test the actual Android device separately; CI cannot prove hardware performance or that every older HTML page looks identical.

**Scope:** Test repository only. Never delete original Developer Mind or modify production as part of visual maintenance.
