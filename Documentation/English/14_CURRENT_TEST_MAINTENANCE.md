# Current Test build maintenance — 16 October 2026

This chapter supersedes older conflicting appearance directions. Work only on the Test repository; production deployment needs separate approval.

## 1. Immediate first paint, no unnecessary loading screen

The root `DedSec-Project-Website/index.html` contains four visible top-bar controls (search, theme, language, home) in the HTML, with inline SVG for the three pictograms and literal text for language. SVG renders without waiting for external Font Awesome fonts or JavaScript. `assets/ui.js` can update the theme SVG after reading preferences but must not create the controls. There is **no timed boot screen** and the home page is usable immediately. `assets/cookie-consent.js` initializes independently of any previous `dedsec:bootcomplete` event.

The imported English and Greek pages use the same principle. `scripts/social_previews.py` idempotently inserts `#merged-search` and `#merged-home` into every existing `.merged-topbar .merged-actions` at build time, using the correct page-relative root link. It also maintains page-specific social metadata. `dedsec/Assets/merged-retro.js` attaches functionality, switches theme/language and only creates icon markup as a last-resort fallback for old offline copies. Keep Search, Theme, Language, Home in that order, without duplicates. The very first DOMContentLoaded state must already include all four controls.

No five-second delay is necessary just to avoid missing icons. If a future release introduces a loader for a genuine asynchronous dependency, the user must explicitly request it and the loader must never pretend that timed waiting means all network calls have finished.

The root search remains `#nav-search`, toggling `#top-search` only when activated. Browser audit checks the four controls at first render and that consent works without loading events.

## 2. Sharp glowing inner cards, no outer double frame

`assets/refinement.css` contains the final overriding selectors. Keep square corners, transparent content surfaces and subtle neon outlines on individual actionable cards. Hide only the large group wrapper frames: `.launcher-group`, `.panel`, `.archive-panel`, `.lesson`, large nested imported `.content-section` and similar wrappers. Preserve keyboard focus styling; do not disable interactive buttons or accordions. Test the 404 actions and imported assistance Copy buttons in both languages.

## 3. Galaxy stars and planets without oval orbits

Both `assets/starfield-dark.svg` and `assets/starfield-light.svg` keep their detailed stars, galaxies and rounded gradient-shaded planets in the 890 x 650 SVG tiles. Explicit outlined elliptical orbit shapes were removed from both assets. Avoid reintroducing decorative oval circles or grid circles. Preserve both palettes and valid SVG geometry; any intentional background artwork changes must update and validate both files together.

## 4. TikDev mobile layout and GitHub discovery

The integrated page is `DedSec-Project-Website/TikDev.html`, not a standalone TikDev folder. Its global `#dedsec-nav` is fixed at the top. The secondary controls use `<header id="appHeader" class="tikdev-toolbar">`, **not** `.app-header`: the original `.app-header` was subject to several conflicting upstream CSS grid rules that placed buttons behind the feed. `#appHeader .header-actions` is a five-column grid (Refresh, Interests, Filter By, Music, Full Screen). Keep the five buttons entirely inside the secondary toolbar at every width.

The feed begins immediately below the controls. The opening TikDev card is top-aligned, not vertically centered in a fullscreen blank region. The bottom Discover, Search, Popular tabs remain at the bottom. Height variables are `--dedsec-nav-height`, `--tikdev-toolbar-height`, and `--tikdev-bottom-height`. Keep the JavaScript `appHeader` ID (the resize observer reads its height) and make language translation target `.tikdev-toolbar .control-label`. No double theme/language selectors or timed auto-refresh.

GitHub discovery remains online-only and handles network failures. A promoted eligible repository appears at the declared cadence of 18 ordinary cards without replacing other owners' results. Test theme switching, Greek copy, the five action hitboxes, button vertical containment, gapless navbar/toolbar/feed/tabs, and the intro appearing near the top of the feed.

## 5. Once-per-week automated refresh

`.github/workflows/tikdev-weekly.yml` schedules a GitHub Actions job at **04:17 UTC each Sunday** and allows workflow_dispatch. GitHub schedules are best effort; they can be delayed or disabled if the repository becomes inactive. `scripts/refresh_tikdev_weekly.py` makes one bounded public GitHub search and best-effort YouTube oEmbed checks, then writes `tikdev/cache/weekly.json`. The job commits only changed snapshot data. The snapshot contains public metadata, not tokens or user details. Do not infer that a YouTube stream is broken from an unavailable oEmbed response; `unverified` is not a failure proof and music controls must remain available. Locally generated ambient tracks require no network. Read the saved `audio` status only for informational metadata.

## 6. Knowledge growth and no duplicate filler

`data/en.js` and `data/el.js` remain the upstream archive. `data/termux-troubleshooting.js`, `data/hacking-guide.js`, and `data/deep-dive.js` are supplemental original bilingual content. The latter adds 18 distinct subjects and 36 language-specific entries across programming, testing, Termux, Git, browser debugging, SQL, and security. Never overwrite the original lesson IDs or repeat a generic paragraph across all 2,000+ lessons to make them appear longer. Expand each chapter with actual correct examples, edge cases, verification and references. Preview snippets end at the last complete sentence; do not append a period to truncated fragments.

## 7. SEO previews, old changelog removal and verification

`scripts/social_previews.py` manages root, all imported DedSec pages, and TikDev HTML metadata: page title and description, favicon, canonical/open graph URL, og:title/description/image, Twitter summary image. Use the shared DedSec logo and image and keep relative URLs accurate within `/Test/`. An old `dedsec/CHANGELOG-2026-10-09.txt` was removed from published website folders; review the git history and English/Greek Documentation instead. Do not delete maintenance records from `Documentation/`.

Run from repository root:

```sh
python3 scripts/validate.py
python3 scripts/social_previews.py
python3 scripts/audit_knowledge.py
python3 -m py_compile scripts/refresh_tikdev_weekly.py
node --check assets/ui.js
node --check scripts/browser_audit.mjs
node --check dedsec/Assets/merged-retro.js
```

The `.github/workflows/static.yml` Chromium job checks at least 179 imported pages, dark/light/mobile/desktop viewport states, real Copy buttons, immediately rendered navigation, first-visit consent, TikDev toolbar geometry, Assistance layout and preserved promotion cadence, and social-preview consistency. Review the **latest** workflow commit SHA, not a previously green build. Revert a faulty Test commit with `git revert` rather than rewriting history. Never automatically promote Test into production.


## Shared top navigation clarified

TikDev has exactly **one** visible theme/language pair in the **DedSec Project global top navbar** (`#dedsec-theme`, `#dedsec-lang`). The old TikDev-specific theme control (`#themeButton`) is hidden and retained solely as an internal compatibility event target; the secondary TikDev toolbar must never offer a second theme or language control. Changes persist to the same `dedsec:theme` / `dedsec:language` preferences as the main site, and language changes update the visible TikDev introductory description immediately. The weekly GitHub Actions refresh has no browser-visible per-session auto-refresh selector.


## Enriching existing algorithms without duplicating results

`data/algorithm-addenda.js` is loaded **after** both original `data/en.js` and `data/el.js` and before `assets/ui.js`. It appends distinct reasoning and boundary-case guidance to 15 pairs of existing `Algorithms_Practice/*.md` and `Αλγόριθμοι_Ασκήσεις/*.md` lessons. It never creates additional lesson IDs or alters adjacent executable `.py` examples. Each file basename must match exactly one record per language and sets an internal non-rendered `__dedsecAlgorithmAddendum` record property to prevent duplicate application. `window.__DEDSEC_ALGORITHM_ENRICHMENT__` exposes English/Greek counts and missing paths; Chromium requires **15 + 15, zero missing**. Carefully author separate topic-specific explanations and edge cases, not repeated boilerplate. This improves an initial group of original lessons; do not claim the full archive has been expanded.


## 8. Assistance directory and synchronized documentation

`dedsec/Pages/assistance.html` and `dedsec/el/Pages/assistance.html` use one plain centered `.assistance-heading` with an H1 and concise subtitle, **not** a framed introduction, second title, or search panel. Exactly 80 original guide links are preserved per language in `.assistance-flat-grid`, with compact, auto-height, outlined cards and no category badges. The layout becomes one column on phones and two on larger viewports. `dedsec/Assets/assistance.css` owns the presentation; individual help documents retain their own copy buttons. `assistance.js` still supports guide-local functions; directory search is intentionally absent.

Every functional change must update both language maintenance chapters in the **same commit**. `Documentation/RULES.md` establishes the requirement and `scripts/validate.py` checks changed paths in Git history. Do not modify production or the original TikDev repository without a separate request.


### Browser check and multilingual path handling

The validator's TikDev structural check must look for `<header class="tikdev-toolbar" id="appHeader">` rather than the removed legacy `.app-header`. For the mandatory documentation pairing, invoke Git with `-c core.quotepath=false`. Otherwise Git quotes filenames with Greek Unicode characters (producing a leading quote before the `Documentation/Greek/` prefix), falsely reporting that documentation did not change. Run this check with both language files in a single commit.


### Toolbar isolation confirmed by real mobile layout measurements

The former `.header-actions` class carried legacy TikDev grid positioning even after its parent `.app-header` was removed. In Chromium at 390 x 844, the first repair still placed button hitboxes at vertical coordinates 117–175 while the secondary toolbar occupied 66–138; the buttons were clipped behind the feed beginning at 138. The control container is now renamed `.tikdev-actions` and positioned absolutely within `#appHeader.tikdev-toolbar` at top 4px, with a 64px grid height and five equal columns. The browser audit measures the parent, grid and all five child hitboxes and fails if any extends beyond its toolbar. Preserve the unique class names and keep the intro near the feed top; do not restore `.header-actions` or `.app-header`.


## 15. Original TikDev ZIP comparison, shared nav artwork and larger project indicators

The owner supplied `TikDev-main.zip` containing the original TikDev `index.html`, its README, license and image. Use it to preserve the repository presentation and interactions, not to overwrite the integrated DedSec build or third-party license. The original `repoCard(repo)` renders title, description, language, topics, README/save actions, profile, stars, forks, share and repository link. Legacy mobile selectors positioned `.feed-card:not(.intro-card) .repo-main` absolutely, effectively removing the repository content from normal flow. `TikDev.html` now overrides that only for `[data-kind="repo"]`, forces the main column and creator actions back into normal flow, and keeps cards readable, scrollable and clickable. It reduces the introduction's height so a real repository is visible below it. It does not change API, playlist, promoted-repository cadence, or fallback behavior. The browser test mocks a GitHub response and verifies repository title, action buttons, normal-flow position, first-screen visibility, and Start Exploring.

The root navbar in `index.html`, integrated TikDev `#dedsec-nav` and imported guide topbars now share the same Search/Home line SVGs and restored **solid filled crescent** Moon (plus Sun for light theme). Runtime updates belong to `assets/ui.js`, `TikDev.html` and `dedsec/Assets/merged-retro.js` respectively. `scripts/social_previews.py` pre-renders Search, Moon and Home SVGs in imported static pages so icons are visible before JS. Consistent control hitboxes are 40x44 pixels on normal mobile and 34x40 at very narrow widths; SVGs are 25 or 23 pixels. The existing language text remains centered. Keep CSS overrides near the end of `assets/refinement.css`, `dedsec/Assets/merged-retro.css`, and the final TikDev style block; do not scatter new conflicting overrides.

Three statistics cards (Google-result placement, stars, forks) in `home()` now have larger fonts and taller hit areas with a wider maximum layout. Keep the source/status of snapshot figures honest. The two paragraphs beneath the stats describe DedSec Project's own cybersecurity/automation tools and their Termux/Linux installation and maintenance, without describing the programming library or TikDev. Source: `assets/ui.js`. Validate width, text changes, four consistent nav controls, and no horizontal overflow in Chromium in dark/light themes. Every future change must update these notes and the Greek counterpart, as required by `Documentation/RULES.md`.


### Validator update after replacing legacy font icons

The static site audit previously required `data-dark="☾"` and `fa-sun` in the HTML. Those legacy Font Awesome indicators are intentionally obsolete. `scripts/validate.py` now checks exactly three `class="ds-nav-glyph"` SVGs (Search, Moon, Home) on the homepage and confirms the JavaScript swaps the theme's inline artwork. Do not restore the old glyph expectation; browser tests also validate consistent button and SVG geometry.


### Final mobile browser audit interpretation

Chromium confirmed the repaired GitHub repository card has a visible project title at y=257 in a feed spanning y=138–776, a 293px normal-flow main area, two README/Save actions and five creator/stat/share/open actions. The compact introduction had legitimately scrolled above the feed's visible region (its title y=31), so the audit no longer requires the intro to remain inside the viewport after interaction; it instead asserts repository content and controls are actually visible. The short paragraph under the three enlarged stats was also reduced to a focused DedSec Project description under the existing 180-character readability budget.


### Restored original TikDev vertical mobile rail and simplified DedSec intro

The user provided a side-by-side screenshot comparing the original standalone TikDev with the test integration. On mobile, the original card keeps creator avatar/name, stars, forks, Share and Open in a **vertical right-side column** and positions the README/Save buttons in a single horizontal row at the **bottom**. The prior integration instead stacked these actions beneath the repository content. Restore the original mobile layout using CSS strictly on `#feed .feed-card[data-kind="repo"]`: a relatively positioned card, main copy with approximately 82px reserved on its right, an absolutely positioned 70px vertical `.side-actions` rail, and an absolutely positioned `.repo-actions` bottom row. Keep normal-flow repo copy, avoid horizontal overflow, maintain link/button hit targets, all five actions, and full README/Save labels. At very narrow widths, shrink only the rail and padding; keep both columns usable. The Chromium audit asserts actual right alignment, vertical action order, and bottom aligned README/Save with a deterministic mocked GitHub repository.

In `assets/ui.js`, remove the entire second `.home-context-summary` paragraph below the three trust cards. The single remaining `.home-about-summary` says only what DedSec Project is (a free cybersecurity and automation toolkit) and where it runs (Android via Termux and supported Linux). Update both English and Greek wording together; preserve the larger trust cards and the three indicators themselves. Thicken only the solid Moon/Sun theme button's moon path using a modest 1.25px stroke in `assets/refinement.css`, imported-page `dedsec/Assets/merged-retro.css`, and the integrated `TikDev.html`. Do not change Search, Language, Home, icon alignment or theme switching.


## 16. TikDev one-card swipe viewer

Restore the original **Swipe less. Discover more.** intro (remove its green eyebrow). The feed between navigation bars has mandatory Y scroll snapping. Each direct feed card occupies exactly 100% of that viewport; momentum scrolling cannot expose portions of two repositories at once. Touchstart/move/end prevents native momentum and moves one card per intentional vertical swipe. Keep desktop wheel/keyboard controls. Repository descriptions/tags use bounded line-clamping so README/Save and the right-side creator/stats/share/open rail stay visible in the same viewport. Full content remains available in the README dialog. Preserve dark/light themes, Greek translation and all GitHub API/fallback functionality. Chromium assertions check intro copy, locale and exact card heights.


### One-card height regression found by Chromium

The first viewport audit measured the introduction at 350px while the repository card was 638px, allowing two cards at once. A legacy `.feed-card.intro-card { height:auto!important; min-height:0!important }` selector overrode the generalized swipe rule. Give `#feed .feed-card.intro-card` its own explicit 100% height/min-height/max-height override after all older selectors. Assert that the intro height equals `#feed` height within 3px, not merely that repository cards are full-height. Chromium may serialize `scroll-snap-type: y mandatory` as `y`, so test its Y axis and actual card geometry instead of only a string containing `mandatory`.


## 16. TikDev full-viewport mobile slides

The first card on every fresh Discover navigation is the original TikDev welcome hero: “Swipe less. Discover more.” without an eyebrow/“Open-source discovery, simplified” kicker. The app's `introCard()` and `translateChrome()` must agree in Greek and English. `#feed` is a scrollable fixed viewport below the two toolbars and above the three mode tabs. Each `.feed-card`, including welcome, actual GitHub repository, loading and error, fills **exactly one feed viewport** with `scroll-snap-type:y mandatory` and `scroll-snap-stop:always`. Repositories never share one screen. All essential texts, five right-rail actions and bottom README/Save buttons must be reachable inside one slide at 390×844; reserve right and bottom space and clamp excessively long descriptions/topics rather than moving actions outside the screen. The full README modal retains unabridged text. Touch swipe or desktop wheel advances exactly one card; no card scaling, fading, or partial stack transforms. Reduced-motion settings suppress transitions. Browser tests must verify initial hero, one-card boundaries, action visibility and snap positions.


## 17. Verified technical expansion and offline search (October 2026)

The Test build deepens **13 existing Reverse Engineering lessons**, **12 original programming Fundamentals**, **9 practical mainstream-language guides** and **8 existing Termux troubleshooting cases** in **each** locale (42 English/Greek topic pairs). Every new section adds distinct knowledge: byte-order demonstrations, Ghidra listing/function graph versus decompiler, self-owned C/DMR1 labs, Android APK and network-capture triage, controlled JS/browser observations, type systems, loop invariants, file/Unicode safety, testing, and platform-specific repair paths. The added code is not a replacement for original lessons: original stable IDs and internal links remain intact.

The complete owner-supplied Hacking-Guide-Project is available as two offline `data/hacking-complete-*.js` files with all **140 English and 140 Greek long-form chapters**, sourced directly from the full combined originals and attributed to `dedsec1121fk/Hacking-Guide-Project`. This is a detailed original reference distinct from the 12 brief getting-started Hacking Guide cards per language; keep it aligned with its source and do not generate overlapping copies. `index.html` loads the new data before `assets/ui.js`; the latter includes `ARCHIVE_HACKING_COMPLETE` in local search.

Original source Markdown parity is mandatory: `Developer's Mind/Keep Programming Alive/{English,Greek}/...` stores the 68 expanded existing Reverse/Foundations/Language articles verbatim with the deployed body, and 16 expanded Termux articles under their matching `Termux_Troubleshooting/` folders. We corrected 304 repetitive generic starter/code sample titles and cleaned up 475 records affected by empty/repetitious boilerplate headings without discarding meaningful runnable code. All **1,188** primary English titles and **1,188** primary Greek titles are now distinct. Check `scripts/validate.py` source parity, titles/IDs, source identity, and the 280-chapter deep reference before any release.

Search stays **local and private**. `assets/ui.js` ranks normalized exact titles and phrase hits above body hits; matches aliases across relevant Greek/English troubleshooting vocabulary; handles limited title typos; and respects language/category filters. It is relevance ranking rather than generative AI and it makes no external request for queries. Extend the synonym dictionary only after reproducing a missed query and measuring false-positive results. The Easter egg is fully reversible and keeps reduced-motion support; TikDev should always show exactly one viewport-height repository per swipe.

**Technical references consulted for verification and content design:** [Ghidra beginner guide](https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/GhidraClass/Beginner), [Python errors and exceptions](https://docs.python.org/3/tutorial/errors.html), [Rust book](https://doc.rust-lang.org/stable/book/), [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [Termux file system layout](https://github.com/termux/termux-packages/wiki/Termux-file-system-layout), [OWASP WSTG](https://wstg.owasp.org/stable/). Cite the original source URL inside individual lessons where used; never copy large external passages.


### Validation threshold and title disambiguation correction

The first combined content run caught two QA assumptions, not lost lesson content. The validator source parity regex was accidentally double-escaped (matching the literal characters `\\d` instead of numerals); it now matches actual source IDs. The Greek byte-order exercise is a substantive 1,416-character article, so the reverse engineering expansion check uses a 1,300-character minimum instead of 1,500, while the complete Hacking Guide still requires each chapter to exceed 2,500 normalized characters. The historical glossary check now accepts a topic's distinct qualified title (for example `Binary search — glossary definition`) rather than demanding reintroduction of ambiguous duplicate names.


## 19. Deepening thirteen existing bilingual engineering lessons

Targeted lessons were enriched *in place*, not cloned into 26 separate listing cards: seven original Reverse Engineering pages (native Ghidra workflow, Electron process boundaries, .NET CIL, firmware triage, evidence provenance, comparing AI and manual analysis, and study paths), and six existing language introductions (Python, JavaScript, Go, Rust, C, Bash). Each uses its own executable or clearly observable lab, failure test and platform boundary. The paired Greek records have independent Greek explanations rather than English filler. Content data is split into four data/lesson-expansions-*.js files for maintainability, keyed by language and original p path, then applied by data/apply-lesson-expansions.js before assets/ui.js. Do not create duplicate entries, URLs, IDs or search cards.

Original Markdown is the same visible lesson: scripts/export_developer_mind.py applies the keyed enrichment when writing Developer's Mind/Keep Programming Alive/{English,Greek}, and scripts/audit_knowledge.py checks exact targets, original record existence, no duplicate blocks and 13/13 parity. The physical Markdown files should be committed with the same improvements when updating content, rather than waiting only for an automated export. The homepage imports each file before the UI runs. Chromium validates 26 applied updates in the root navigation checks.

Official references for verification: Ghidra's NSA beginner course; Electron Security Tutorial; Microsoft Learn on IL Disassembler; Python Exceptions and venv; MDN event loop; Go error/testing tutorials; Rust Error Handling; and GNU Bash Manual. The original Hacking Guide corpus remains the separate attributed reference, not a second paraphrase of these topics.

### Effective-source parity of the 26 expanded lessons

Base index records retain stable IDs and original URLs. The expanded canonical Markdown equals its base record plus its precisely keyed, authored bilingual extension. scripts/validate.py checks the full merged content for exact equality on all previously audited 68 source pages and confirms 26 unique extension keys. Do not remove parity validation or substitute a substring check.

## 18 October 2026 — Haxe/Elm source-keyed remediation

This Test-only editorial batch replaces the repeated investigation filler in Haxe and Elm mastery paths (English and Greek), and the paired Elm form-validation workbooks. Canonical source paths are unchanged. Haxe mastery keys are Programming_Languages/Web/Haxe/03_MASTERY_PATHWAY.md and Γλώσσες_Προγραμματισμού/Γλώσσες διαδικτύου/Haxe/03_ΔΙΑΔΡΟΜΗ_ΕΞΑΣΚΗΣΗΣ.md; Elm mastery uses the corresponding Elm/03_MASTERY_PATHWAY.md and Elm/03_ΔΙΑΔΡΟΜΗ_ΕΞΑΣΚΗΣΗΣ.md. Elm workbook keys are Elm/01_EXPANDED_WORKBOOK.md and Elm/01_ΟΔΗΓΟΣ_ΑΣΚΗΣΕΩΝ.md. Prefix each path with its locale archive root, not with the website data directory.

The website source-keyed records are stored in data/lesson-expansions-residual-04.js (Haxe/Elm mastery, including newly explicit Greek replace entries) and data/lesson-expansions-programming-b.js (Elm workbooks). The wrapper MUST remain window.ARCHIVE_LESSON_EXTENSIONS=(window.ARCHIVE_LESSON_EXTENSIONS||[]).concat([...]);, and each append field must match the corresponding Markdown body after trimming. Keep these scripts before data/apply-lesson-expansions.js. Never create a second locale/path entry elsewhere.

Haxe examples distinguish --interp from generated JavaScript run with Node and include empty-input, type-error and overflow analysis. Elm mastery uses Browser.sandbox with a pure counter update; the workbook uses String.toInt and Html.text with an explicit form boundary and accessibility follow-up. These are static, reasoned examples: Haxe and Elm compilers were not available in the authoring environment, so compiler/browser execution is NOT verified. A future maintainer with those runtimes must record versions and actual outputs. This batch is not a claim that all 1,914 Markdown pages or the full browser suite have been reviewed.

### 18 October 2026 — Haxe/Elm language introductions and strict Haxe input

A second, distinct Test-only batch replaces Haxe.md and Elm.md in both languages and the paired Haxe/01_EXERCISES.md and Haxe/01_ΑΣΚΗΣΕΙΣ.md. The landing pages now teach exhaustive Haxe enum matching and the data-loss hazard of Elm List.filterMap respectively; the Haxe exercise teaches anchored ASCII-digit validation, numeric bounds and long-input limitations. Do not paste the mastery counter or average examples into these introductions: each source has a separate learning objective.

Source-keyed website replacements are in data/lesson-expansions-batch-01-languages.js (Haxe landing), data/lesson-expansions-batch-04-languages.js (Elm landing) and data/lesson-expansions-residual-04.js (new Haxe exercise entries). These three scripts retain the exact ARCHIVE_LESSON_EXTENSIONS .concat(...) wrapper and load before apply-lesson-expansions.js. Each locale/path key is unique and its replace body matches the corresponding Markdown after trim. The original index records and IDs are not changed.

Haxe and Elm toolchains were absent from the available local runtime, so examples are reasoned but not marked executed. When a compatible compiler is available, record its version, run the normal and negative tests, and distinguish compilation from browser/Node execution. No claim of whole-archive completion or full-checkout browser validation is made.

### Haxe strict-port follow-up — newline and bounded conversion

The Haxe/01_EXERCISES.md parser now limits input to 1–5 characters before numeric conversion and checks that EReg.matched(0).length equals the original input length. A dollar anchor alone may match before a trailing newline in some regex implementations; the additional consumed-length check rejects that case. The paired Greek source and both website replace entries were updated together. The five-character policy intentionally rejects six-character leading-zero strings. Haxe runtime remains unavailable for actual execution verification.
