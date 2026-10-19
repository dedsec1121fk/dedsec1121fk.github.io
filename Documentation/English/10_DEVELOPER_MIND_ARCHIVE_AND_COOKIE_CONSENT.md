# Source archive, privacy and persistent consent — maintenance reference

## Developer Mind source safety
The user-provided `Developer-Mind-Project-main.zip` was inspected in this project. Its content includes original English/Greek programming material, source files, knowledge projects, and maintenance guidance. The public Test website is **not** a complete migration of that archive; its `data/en.js`, `data/el.js`, and `data/methods.js` are searchable snapshots, not replacements for editable source, provenance, attribution, or version history. Do not automatically import private snippets, execute archived examples in users' browsers, delete the source repository, or claim the entire ZIP is verified. A full migration requires a separate source-by-source privacy/licensing/provenance audit and explicit owner approval.

## Current storage policy — no saved lessons
- Saved Lessons, Add bookmark, Remove bookmark and bookmark shortcut are removed from `assets/ui.js`. A prior `#saved` link opens the ordinary library; no saved-list storage or reading history remains.
- Language and dark/light galaxy theme are **saved between visits** using localStorage keys `dedsec:language` and `dedsec:theme`. Search terms, filters and reading position are not stored.
- The explicit optional-content decision is stored persistently as `dedsec:cookie-choice` in browser localStorage. This is **not an HTTP cookie**. Visitors can change it through Cookie Preferences on Home. The controller cleans only the obsolete `dedsec:bookmarks` key and migrates an earlier `dedsec:consent-this-tab` session choice if no persistent decision exists.
- Accept lets the root launcher load optional GitHub API count refreshes from `api.github.com`; Decline keeps them unloaded. The root library and imported full-text guides work without those badges. No Google Analytics or Google Tag Manager is installed by the Test consent controller.
- The final Cookie Preferences pixel-icon tile is **inside the main Home section**, after every launcher icon, as the final icon tile. It is not fixed, not floating, and does not cover any reading page. Other pages can use the navbar Home button to return to it. A first-visit choice dialog still appears anywhere if no current-tab decision exists.
- The controller lives in `assets/cookie-consent.js`; UI style in `assets/galaxy.css` and `assets/ui.css`; imported guide hook in `dedsec/Assets/merged-retro.js`. English and Greek Test privacy pages match this behavior.

## Responsive and transparent content contract
The root navigation is Search, Theme, Language, then **Home at the far right**. Imported pages use the same four controls in one equal-width grid. At narrow widths the logo/title can wrap, but it cannot consume the Home action's allocated width. A gallery detail view, Search, every category, library, and lessons retain the navbar.

All root archive views use `archive-heading` with a distinct title and relevant English/Greek subtitle. Each of the twelve categories has its own meaningful short description. Lesson intros use the lesson's actual title and source subject rather than a repeated canned subtitle. Imported pages preserve their author-written headings; `completeHeadings()` only fills a missing H1 and an available metadata description. Never duplicate a heading or manufacture article content.

Root results, folder cards, filters, and archive panels are transparent so the stars and galaxy remain visible; borders keep separate items distinguishable. Inputs can have a very faint tint, code areas retain stronger contrast for readability, and the cookie **modal** needs an opaque-enough surface to be legible. Imported requirements, warnings, FAQs, notes and outer panels use transparent backgrounds. Naturalistic butterfly-wing SVGs and the nebula, planets, and stars are static local graphics for low repaint cost.

## Rebuild and manual QA
1. Pull Test only and record its last good commit SHA. Run `python3 scripts/validate.py` and Node syntax checks on `assets/ui.js`, `assets/cookie-consent.js` and `dedsec/Assets/merged-retro.js` before committing.
2. At 320, 360, 390, 760 and 1280 CSS px, verify four action buttons including Home are visible without horizontal scrolling, in English and Greek, in light and dark themes.
3. Open `#home`, `#library`, `#search`, all `#category:...` views and a `#read:<id>` lesson. Verify centered headings/subtitles, no saved controls, visible complete text, and galaxy behind panels.
4. Open English/Greek Installation, FAQ, Assistance and Privacy. Verify Home navigation, generated headings only if needed, full backgrounds transparent, and functional forms/links.
5. Visit without a consent decision: verify both buttons. Decline and check Network shows no `api.github.com` requests. Accept and check the numerical GitHub counts can refresh. Follow a guide within the same tab, return Home, reopen the dialog with the embedded button; close and reopen the browser to verify the consent choice remains saved, and reopen settings on Home to change it.
6. Inspect Application Storage: localStorage should contain only the permitted Test keys `dedsec:language`, `dedsec:theme`, and `dedsec:cookie-choice`; the old bookmark key should be cleared.
7. Test reduced motion, keyboard focus, skip intro, Easter-egg Restore, and offline search. Green CI proves structural checks and publishing, **not** browser/device visual QA.

## Human and AI responsibilities
Human editors should compare browser-computed styles against the final overrides and preserve imported content. AI editors must ground changes in current files, report tests actually performed, never claim exact original content equivalence from a file-count check, and must not change production, delete Developer Mind, or enable external analytics without an explicit separate request.


**Maintenance note (16 October 2026):** GitHub Stars (**914**) and Forks (**380**) are verified bundled snapshots visible even after Decline. Consent enables an optional direct GitHub API refresh, with network failure leaving the snapshot intact. Cookie Preferences is now a pixel-art app-style icon tile below the trust row, and Accept/Decline buttons have separate icons. All four navbar controls share equal sizes, theme-consistent colors and wider gaps. Imported pages have stronger transparent background overrides for page headers, requirements and notes; code/input contrast is preserved.


### Static sharing preview maintenance (16 October 2026)
`scripts/social_previews.py` generates real HTML-head metadata for Home and every imported page: unique `og:title`, `og:description`, `og:url`, locale, a 1200×630 branded `og:image`, image alt text, and Twitter card/title/description/image. All links and the shared social image use **https://ded-sec.space/Test/**, never the original production site. Generation is idempotent and enforced by `scripts/validate.py` before each deployment. See `Documentation/English/11_SOCIAL_LINK_PREVIEWS.md`.
