# Complete Test website maintenance: human and AI

## Purpose, ownership and safe boundaries
The `dedsec1121fk/Test` repository is an isolated static GitHub Pages staging site. Never push to production DedSec or delete the Developer Mind repository through this workflow. The mirror under `dedsec/` preserves the original public DedSec HTML and assets. The programming archives `data/en.js`, `data/el.js`, and `data/methods.js` are read-only searchable snapshots. The separately supplied Developer Mind ZIP is source reference material, **not proof of complete migration**. Preserve rights, context and provenance if expanding it. See `10_DEVELOPER_MIND_ARCHIVE_AND_COOKIE_CONSENT.md`.

## File ownership and maintenance map
| File | Single responsibility |
| --- | --- |
| `index.html` | Root document, four-action navbar, five-second branded boot, footer, preload order |
| `assets/ui.js` | Launcher registry, category intros, search, 21 app shortcuts, lesson reader, bilingual UI, Home cookie button, Easter egg |
| `assets/ui.css` | Root layout, 3-column portrait and 6-column landscape/desktop, centered intros, transparent result cards, equal-size header actions |
| `assets/galaxy.css` | Shared dark/light galaxy, contrast tokens, transparent overlays and cookie modal styles |
| `assets/starfield-dark.svg`, `assets/starfield-light.svg` | Lightweight static natural butterfly/planet/stars artwork |
| `assets/cookie-consent.js` | One bilingual consent dialog, saved Accept/Decline decision, optional GitHub count refresh gating |
| `dedsec/Assets/merged-retro.css` | Last compatibility CSS for all imported HTML pages; transparent old panels, responsive navbar |
| `dedsec/Assets/merged-retro.js` | Imported header Home/Search/theme/language, fallback titles, cookie dialog hook, reversible Easter egg |
| `dedsec/Pages/privacy-policy.html` and `dedsec/el/Pages/privacy-policy.html` | Accurate Test privacy disclosures |
| `scripts/import_dedsec.py` | First-import source mirror; inspect before ever allowing a forced reimport |
| `scripts/validate.py` | Fast Python structural checks before any push |
| `.github/workflows/static.yml` | Single validation and GitHub Pages deploy workflow on main |
| `Documentation/English`, `Documentation/Greek` | Parallel human and AI maintenance reference |

## How the interface must behave
There are 21 launcher tiles. The first eight follow the original screenshot's top-down navigation excluding Home: Installation, Learn About Tools, Assistance, FAQ, Privacy, Contact, Founder, Sponsor; education proceeds from Foundations to Advanced Engineering. Full Greek/English labels appear without cosmetic filename extensions; actual link destinations and file formats remain unchanged. **Saved Lessons and every bookmark feature are removed.**

Home and Search work without saved lessons; theme and language choices persist in localStorage between visits. The root/imported header contains exactly **Search, Theme, Language, Home** in that order; Home is the far-right control on **every** page, including archive category and full lesson pages. Give all four controls reserved fixed widths. On narrow screens let the brand title wrap onto two lines but never hide any action. Root home icons show 3 columns on portrait mobile (up to 760px) and 6 on landscape/desktop. Titles, category descriptions, form controls and results are centered consistently. Keep lesson bodies/code readable with proper left alignment.

For every root archive view, `sectionIntro()` renders a centered real title and useful bilingual subtitle. `categoryIntro` has twelve topic-specific entries. `completeHeadings()` on imported full guides adds only *missing* H1 or available metadata subtitle and must never repeat existing author text.

Backgrounds of archive panels, cards, search controls and imported content wrappers are transparent to reveal the galaxy. Keep borders for grouping and enough ink contrast; lightly tinted code blocks and cookie dialogs are exceptions because full transparency would harm legibility. The galaxy must remain local and still, with natural butterfly silhouettes, planets and stars rather than continuous CPU-heavy effects. Avoid repeated stylesheet overrides when a canonical final selector can be edited directly.

## Privacy and consent
There are **no saved lessons, bookmarks or reading history**. Theme and language persist under `dedsec:theme` and `dedsec:language` in localStorage. The Accept/Decline choice persists under `dedsec:cookie-choice` in localStorage, so visitors are not asked repeatedly. These are local browser storage entries, not HTTP cookies. The controller cleans only the obsolete `dedsec:bookmarks` key and migrates an existing prior-session consent choice when available. Decline and Accept are equal choices. No Google Analytics/Tag Manager is added by Test. A **non-floating Cookie Preferences button belongs on the Home intro**, at the end of the launcher grid. Users can return there via the top-right Home action. The consent dialog may appear on any page if no session choice exists.

## Manual maintenance without AI
1. Clone only Test. Record the current working main SHA before changing files.
2. Inspect the precise current HTML, JS, and winning CSS declarations; identify whether the issue is root `#app` or imported `dedsec/`.
3. For root titles/categories, edit `assets/ui.js` once. Avoid duplicating category descriptions or cutting titles with CSS.
4. For imported guide styling, modify the common compatibility CSS/JS rather than 179 individual pages. Keep original content, links, licenses and translations intact. Verify all HTML are still present.
5. For archive data changes, work from approved original sources, compare unique IDs, languages, body hashes and test examples; do not copy boilerplate templates.
6. Run `python3 scripts/validate.py` and `node --check assets/ui.js assets/cookie-consent.js dedsec/Assets/merged-retro.js` individually (Node takes one file per call). Run a local static server to inspect mobile and desktop.
7. Test widths 320, 360, 390, 760, 1280 CSS px, portrait/landscape, dark/light, Greek/English, and a real Android browser. Check root Home, a category, a result, Installation, FAQ and Privacy.
8. Verify no client-side saved controls, saved theme/language/consent values across reload, no optional image requests on Decline, the Home cookie button on Home **only**, and accurate privacy links.
9. Commit and deploy in **one batched push**. Read GitHub Actions failures before retrying to conserve minutes. Compare live Pages rendering. Revert using the saved SHA if needed.

## Maintenance with AI
Ask the AI to first inspect exact current source files, identify selectors and test constraints, and provide a minimal reviewable diff. Demand a list of actual checks run, any unmet browser QA, and an explicit declaration that production and Developer Mind originals were untouched. AI must not silently delete source files, duplicate template lessons, infer platform parity, or report visual verification from static CI.

## Recovery
A stuck boot screen must offer Skip intro; it calls `dedsecBootReady()` after initial render. Search errors usually mean missing local `data/*.js` files; check browser console and the original file paths. If navbar Home disappears, inspect four reserved grid columns and `.merged-home` in the imported shared script. If solid backgrounds reappear, inspect computed CSS and eliminate the responsible source-era declaration without dropping content or making code unreadable. If consent is wrong, check localStorage consent and deferred badge URLs, not HTTP cookies. The Easter egg is visual-only and Restores without deleting content.

## Evidence limits
Structural CI can prove file presence, syntax and the stated invariants, not exact body-content equivalence, device performance or perfect appearance on the user's phone. Record outstanding browser tests explicitly.


**Maintenance note (16 October 2026):** GitHub Stars (**914**) and Forks (**380**) are verified bundled snapshots visible even after Decline. Consent enables an optional direct GitHub API refresh, with network failure leaving the snapshot intact. Cookie Preferences is now a pixel-art app-style icon tile below the trust row, and Accept/Decline buttons have separate icons. All four navbar controls share equal sizes, theme-consistent colors and wider gaps. Imported pages have stronger transparent background overrides for page headers, requirements and notes; code/input contrast is preserved.


### Static sharing preview maintenance (16 October 2026)
`scripts/social_previews.py` generates real HTML-head metadata for Home and every imported page: unique `og:title`, `og:description`, `og:url`, locale, a 1200×630 branded `og:image`, image alt text, and Twitter card/title/description/image. All links and the shared social image use **https://ded-sec.space/Test/**, never the original production site. Generation is idempotent and enforced by `scripts/validate.py` before each deployment. See `Documentation/English/11_SOCIAL_LINK_PREVIEWS.md`.


## Real-browser visual inspection (October 2026)
The build runs `scripts/browser_audit.mjs` with **headless Google Chrome/Chromium through playwright-core**, serving the generated pages locally at 127.0.0.1:8765. Audit points: 390px dark/light Home, 390px dark/light Installation, 1280px desktop Home; four navbar controls, actual pixel-cookie SVG visible, approximately 20% smaller trust section, sub-180-character localized descriptive copy, transparent legacy content panels, and zero horizontal overflow. The step uploads five PNG screenshots and `audit.json` as GitHub Actions artifact `test-chromium-audit`. Check that artifact; CSS-computed values are also printed in workflow logs. This does not imply the actual public Test domain or a personal Android phone is accessible from the browser harness. If a computed-style assertion fails, inspect the selectors and rerun only after a fix.

The cookie icon bug was caused by a localization function using `querySelector("span")` and overwriting the SVG container. It now targets `.app-label` only. Never use a generic span query when a control contains both an icon and text. Imported fixed topbars intentionally have an opaque `--space-start` background; article headers and cards must remain transparent.


## Unique knowledge titles without deleting real material (16 October 2026)
The full knowledge audit covers all **2,406** English, Greek and reasoning records, including each source body's individual lines. Source filenames such as `00_reference_sample.txt` legitimately repeat across different programming languages; identical titles must **not** cause two different files to become indistinguishable. `assets/ui.js` now prefixes globally repeated titles within a locale with their final two source directories, e.g. `Array / APL — 00 reference sample` and `Array / BQN — 00 reference sample`. The category view and reader use the same display title. Source IDs, bodies and ordering are preserved. `scripts/audit_knowledge.py` now rejects any identical **rendered** title within the same knowledge dataset, in addition to duplicate IDs, source paths and complete bodies. This is machine-assisted line-by-line validation, **not** a claim that every example was manually or experimentally verified.
