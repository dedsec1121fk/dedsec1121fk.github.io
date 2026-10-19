# Test website: TikDev, loading, search, glowing UI and knowledge maintenance

Status: **Test repository only**. This chapter supersedes conflicting historical appearance notes in older maintenance chapters. Do not replace the live production repository or delete source projects without explicit authorization.

## Site architecture

- `index.html` owns the shared DedSec header, ten-second loading overlay, programming-library shell, and static browser metadata.
- `assets/ui.js` defines the ordered bilingual launcher registry (`APPS`) and category map (`CATS`). The single navbar search icon opens the existing `#library` search field; there is **no independent search app tile or #search page**.
- `assets/cookie-consent.js` shows first-visit consent only after `dedsec:bootcomplete`. The boot event is dispatched when the loading overlay has been removed. An explicit Cookie Preferences click continues to work afterward.
- `assets/refinement.css` holds the latest angular neon/glow outline rules. Backgrounds inside content areas stay transparent. Edit shared styling here rather than adding more page-specific overrides.
- `dedsec/Assets/merged-retro.js` restores imported accordion and copy controls, and ensures the same transparent, angular card appearance in bilingual articles.
- `data/en.js` and `data/el.js` preserve the original bilingual archive. New, separately maintained original lessons live in `data/termux-troubleshooting.js`; hacking-safety lessons remain in `data/hacking-guide.js`. Every lesson keeps a unique ID, language, source path, title, category group and substantive markdown body.
- `tikdev/index.html` is the **integrated fork** of `https://github.com/dedsec1121fk/TikDev`. Its upstream repository is untouched. Keep `tikdev/LICENSE` with the embedded code, and compare upstream changes manually before syncing.

## TikDev capabilities and limitations

TikDev uses public GitHub API requests for discovery, detailed repository cards, README viewing and public starred-repository checks. Rate limits, offline mode or API failures should display a retry state; they cannot be bypassed by static-page code. Do not embed private credentials or tokens. The optional YouTube audio player contacts YouTube only after playback is chosen. Two synthetic ambient options are generated locally through Web Audio; they are **not recordings of rain**. A custom YouTube URL field accepts recognized YouTube hosts and a valid video ID.

The shared DedSec design is reproduced in a fixed top navigation bar in TikDev. It uses `dedsec:theme` and `dedsec:language` browser preferences, points back to `../index.html#home`, and provides one search control. The secondary TikDev controls are purpose-specific Interests, Filters, Music, Refresh and optional fullscreen. Most TikDev interface chrome has Greek/English translations; imported GitHub descriptions and README files remain in their authors' language and are not automatically translated.

Refresh: `#dedsec-refresh` reloads the current GitHub results manually. `#dedsec-auto` optionally repeats after 5, 10 or 20 minutes while the tab is visible. Auto-refresh defaults to Off and uses the public API quota, so avoid a high-frequency default.

Promotion cadence: `state.nextPromotionAt = 18` and `placeCadencePromotion()` insert **at most one eligible DedSec repository after each 18 regular repository cards** in the loaded feed (18, 36, 54, ...). The existing exclusions for repositories the user has publicly starred or marked locally starred remain in effect. This is not every 18 minutes; it is a card-count cadence. No promotion is inserted into Saved results. Failed GitHub requests must not prevent the ordinary feed from loading. Promotions are visibly labeled in the source card UI. Do not overwrite other authors' cards.

## Knowledge excerpt algorithm

`shortSentence(value,max)` strips Markdown and chooses the last full sentence-ending punctuation within the character budget. When the first complete sentence exceeds the budget, it shows that complete first sentence rather than manufacturing a period after a fragment. This can produce a longer card and is intentional. Do not reintroduce a naive `slice(0,max)+'.'` preview; it is misleading. Source lesson text itself is never shortened.

## Bootstrap and consent

The initial `booting` body class hides the main page and navbar even on slow phones. Only the galaxy image/animations, DedSec Project name and a ten-second live progress bar should appear before startup. Remove the class *after* the overlay leaves, then dispatch `dedsec:bootcomplete` to offer cookie consent. Confirm there is no language/theme button behind the overlay while booting. If assets fail, the fallback still dismisses the overlay; never trap users.

## Social previews and testing

`scripts/social_previews.py` generates static Open Graph and Twitter tags for the root, all imported DedSec articles and TikDev. Every standalone HTML file should have: a unique usable title, description, favicon pointing to the bundled project logo, canonical/test URL as appropriate, image and alt text. The shared OG JPEG is `dedsec/Assets/Images/og/og-dark.jpg`. Keep the `DEDSEC_TEST_SOCIAL_START/END` markers idempotent and ensure no production-domain output outside `/Test/`.

Run these commands from repository root:

```sh
python3 scripts/import_dedsec.py
python3 scripts/social_previews.py
python3 scripts/audit_knowledge.py
python3 scripts/validate.py
node --check assets/ui.js
node --check assets/cookie-consent.js
node --check dedsec/Assets/merged-retro.js
node --check scripts/browser_audit.mjs
python3 -m http.server 8765 --bind 127.0.0.1
```

Run Chromium on a machine with Playwright as described in `.github/workflows/static.yml` and inspect the `test-chromium-audit` artifact. Confirm first-visit cookie timing, TikDev theme/header, locale choices, card-count promotions, optional music, copy buttons, search, glowing angular panels, horizontal overflow, light/dark contrast and Greek/English articles. **Do not claim browser success from source checks alone.**

## Update / rollback

Push to Test main only after structural checks pass; observe GitHub Actions and the preview URL, then test on Android Chrome. To roll back, revert only the offending commit and allow Pages to redeploy. Production migration requires explicit permission and a separate review.
