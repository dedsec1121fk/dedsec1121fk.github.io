# Borderless galaxy and bilingual reference review

## What changed
Test uses a sharp-cornered, visually quiet Windows 95-inspired layout. Styles prefer `"MS Sans Serif"` if installed and fall back to Tahoma/Microsoft Sans Serif/Arial; these are **system font names**, not bundled proprietary font binaries, so exact glyph shapes differ on Android. The dark theme uses white foreground and a stronger black overlay (`rgba(0,0,0,.72)`), while light uses near-black text and a subtle white overlay. Borders and shadows are removed from normal cards, imported guide sections and navbar tiles, but keyboard `:focus-visible` receives a dotted focus indicator and form fields retain bottom rules for usability.

The same locally cached SVG galaxy powers all pages. The 890×650 dark and light scenes now include four further faint galaxy clusters, three differentiated planets, 110 tiny stars per theme and existing nebulae, gradients and larger planets. There are no decorative butterfly silhouettes in the background; the **brand logo itself is preserved**. The SVGs are static: no looping canvas effects or continuous scroll painting.

## Knowledge review
The full `scripts/audit_knowledge.py` reads the body of each of **1,188 English, 1,188 Greek and 30 reasoning** records, checks identifiers and paths, scans source lines for repetitions and reports exact duplicate bodies. The previous source already contained no exact duplicate complete bodies, but some brief entries offered little beyond a definition. In this batch, **31 specifically chosen concepts and Python error documents per locale** have been expanded individually. These are 21 glossary articles from Algorithm through CLI and 10 Python error articles (SyntaxError, IndentationError, NameError, TypeError, ValueError, KeyError, IndexError, ModuleNotFoundError, FileNotFoundError, PermissionError). Each appendage explains a distinct technical pitfall or practical use case, with concrete examples, in the correct language. Original content and 2,376 total lesson records are preserved. This is **not a claim that all lessons were individually rewritten**; scripts, indexes and remaining definitions must be expanded only from valid source material when demonstrably useful.

Avoid stock lesson filler, identical paragraph templates, false platform claims or changing executable code samples merely to increase word counts. Preserve source paths and IDs so imported search routes do not break.

## Test and maintenance
Run `python3 scripts/audit_knowledge.py`, `python3 scripts/validate.py`, then `node --check` for root scripts and `scripts/browser_audit.mjs` in GitHub Actions. The Chromium script checks distinct light/dark nav colors, pointy navbar controls, no surrounding borders on key guide panels, centered archive headings/lesson content, and mobile overflow, saving screenshots. Browser checks use a locally hosted copy of the deployed site; validate a real Android browser separately before asserting pixel-perfect parity. Future editors should modify the canonical CSS instead of stacking unnecessary broad overrides.

The source Developer Mind repository is unchanged; production DedSec Project is unchanged.
