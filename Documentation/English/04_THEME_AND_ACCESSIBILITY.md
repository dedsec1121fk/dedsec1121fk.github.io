# Theme, responsiveness and accessibility — canonical Test guide

## Layout contract
- Root navbar and every imported guide: butterfly + complete brand title on the left; **Search, Theme, Language, Home** on the right. The four controls have explicit equal widths, with Home last.
- At narrow widths, reserve the four-button grid first and allow the title to wrap onto two lines. Never hide, clip or enlarge the Home action.
- Main launcher: 3 columns in mobile portrait, 6 in landscape/desktop; full natural English/Greek labels, without filename extensions.
- The archive's Home has 21 shortcuts; Saved Lessons and bookmark controls have been removed.
- Category, library, search and lesson pages use `sectionIntro()` with a centered title and relevant subtitle. The author text inside each lesson remains left-aligned.
- Imported guides use their existing title. `completeHeadings()` inserts only missing titles/descriptions found in existing document metadata.

## Color and background source
`assets/galaxy.css` is the single palette and background source. It references the local dark/light SVG scenes with natural butterflies, glowing stars, planets and subtle nebulae. These are static, not constantly animated.

The last rules in `assets/ui.css` make result cards, archive panels, trust items and category tiles transparent. Search input/select fields can be faintly tinted for readability, never with leftover opaque paint. The last rules in `dedsec/Assets/merged-retro.css` similarly neutralize old backgrounds from imported HTML. Borders and contrasting text remain. Code blocks and the actual consent dialog may retain stronger backgrounds for legibility.

## Consent and privacy placement
No floating cookie manager. `assets/ui.js` generates the **Cookie Preferences button on Home only**, at the end of the launcher grid. `assets/cookie-consent.js` creates one accessible overlay (equal Accept/Decline), not a permanent overlay or a fixed button. It remembers the explicit Accept/Decline choice in localStorage, while theme and language are also saved across visits. Bookmarks and search are not persisted.

## Accessibility checks
At 320/360/390/760/1280 CSS pixels: check touch-target size, complete title wrapping, tab order Search→Theme→Language→Home, focus ring visibility, contrast in light/dark themes, form select visibility, code horizontal scrolling, reduced motion, and Escape/Restore behavior. Test Greek and English, native Android and desktop. The consent dialog must keep focus on its actions until a decision is made and link to the language-correct privacy policy.

## Editing with or without AI
Read the actual current rules and computed styles before writing overrides. Refactor the canonical selector instead of reintroducing hard-coded old colors or duplicated gradients. AI suggestions require manual visual confirmation; CI syntax cannot prove screenshots.

See `09_COMPLETE_MAINTENANCE.md` for full source ownership and `10_DEVELOPER_MIND_ARCHIVE_AND_COOKIE_CONSENT.md` for privacy behavior.


**Maintenance note (16 October 2026):** GitHub Stars (**914**) and Forks (**380**) are verified bundled snapshots visible even after Decline. Consent enables an optional direct GitHub API refresh, with network failure leaving the snapshot intact. Cookie Preferences is now a pixel-art app-style icon tile below the trust row, and Accept/Decline buttons have separate icons. All four navbar controls share equal sizes, theme-consistent colors and wider gaps. Imported pages have stronger transparent background overrides for page headers, requirements and notes; code/input contrast is preserved.


### Static sharing preview maintenance (16 October 2026)
`scripts/social_previews.py` generates real HTML-head metadata for Home and every imported page: unique `og:title`, `og:description`, `og:url`, locale, a 1200×630 branded `og:image`, image alt text, and Twitter card/title/description/image. All links and the shared social image use **https://ded-sec.space/Test/**, never the original production site. Generation is idempotent and enforced by `scripts/validate.py` before each deployment. See `Documentation/English/11_SOCIAL_LINK_PREVIEWS.md`.
