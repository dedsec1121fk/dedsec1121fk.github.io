> Current release: [account behavior and production promotion](24_ACCOUNT_RELEASE_AND_PRODUCTION.md). Earlier dated observations below are historical.

# Test account email-change and interface maintenance

Applies **only** to `dedsec1121fk/Test` and the `dedsec-test-accounts` Worker. Do not copy these settings into production or the backup without an explicit security release review.

## Two-address email change
- The user must be signed in, have a verified current email and confirm the current password. The request is rate limited. The new email must be unused and must not conflict with canonicalized Gmail identities.
- The Worker emails a one-hour approval link to the **current** email. Opening the link (GET) only displays a confirmation form and **does not** approve it. Pressing the button (POST) proves approval and sends a separate one-hour verification link to the **new** email.
- Opening the second link displays another confirmation; pressing it (POST) proves ownership of the new mailbox, updates the email and unique email-identity hash in the same D1 transaction, revokes sessions and removes pending tokens. The account's private notes, recovery verifier, referral code and passkeys remain in its original user ID.
- The user's password does not change. The browser's client salt is stored against the user ID, and login challenges fetch that salt through the new address.
- Code: `account-service/email-change.mjs`, `mail.mjs`, `worker.mjs`, `assets/account-security-ui.js`. D1 migration: `account-service/migrations/0006_email_change.sql`; the service uses `CREATE TABLE IF NOT EXISTS` defensively until the migration is applied. Do not run a migration twice unnecessarily.
- Security checks: no raw password sent to the Worker; reauthentication via existing password verifier; unpredictable one-time tokens stored as hashes, valid for one hour; no token confirmation on GET, no newsletter; account sessions invalidated only once new ownership is confirmed. In a mail failure, do not advance to the next stage.

## Account window and feedback
- Cookies: `assets/cookie-consent.js` attaches the choice screen **after the main loading screen** and does not display inside the Worker account iframe. A saved accept/decline preference persists across visits; use a new browser profile for first-visit tests.
- Login screen: preserve an accessible compact non-scrolling login when viewport height allows. On short floating windows, scrolling must remain available so the fields are reachable.
- Error alerts: `account-live.js` and `account-template.js` use the same five-second toast; errors display with a red background and white text. `account-feedback` should not occupy permanent page space.
- Account UI: remove redundant preview wording and the duplicate Forgot password shortcut, retaining the separate Reset password tab. A verified email indicator has a visible border.
- Floating account: `assets/test-account-float.js` manages a square minimized icon with X dismissal, pointer dragging, and a bottom-right resizing grip. `account-shell.css` sets initial floating size to half of each viewport dimension; expanding from the grip is limited to the visible viewport. Do not hide the signed-in TXT workspace scroll.
- Home reflection: `assets/test-home-copy.js` connects Epictetus' distinction between what is up to us and what is not to informed digital choices; the application to DedSec is modern.

## Release and regression gate
Run `node scripts/test_account_service.mjs`, `node scripts/test_account_mail.mjs`, and the Playwright `scripts/browser_audit.mjs` and all other GitHub Actions checks on Test main. Before deploying the Worker, wait for a successful GitHub Pages deployment of the same code and verify that its seven JS modules preserve every existing database and secret binding. Test links against the Worker test origin only. Real cross-browser email delivery and passkey support require an actual device test.

## Portable publication and merged reflection

`account-shell.js` loads `test-account-float.js` once on every outer Account page, including subpages and generated lessons. `account-shell-config.js` contains configuration only: the builder overwrites it per profile, so it must not own behavior. The embedded portal does not load another outer shell. This fix needs no Worker or database change.

`test-home-copy.js` merges historical context and the modern privacy comparison into one paragraph and removes obsolete `.aristotle-explanation` blocks. It writes text only when changed, avoiding continuous MutationObserver rewrites. Both languages follow the same structure, without a homepage source link.

The browser audit exercises source **and generated Test output** in English/Greek: initial half-size geometry, resizing, square minimized control, X dismissal and draft retention. Homepage checks require exactly one reflection and no second block. Manually check a subpage by opening Account, floating, minimizing and restoring it. Real email delivery, human CAPTCHA and device passkeys require live checks; mocked tests do not establish those outcomes.

Rollback: restore shell, profile configuration, copy and documentation together from the preceding commit and rebuild Test only. Preserve D1 and secrets; private data is unchanged.

The merged paragraph has a 700-character browser-test ceiling rather than the old 180-character teaser ceiling; the test also rejects a second explanation block.

The resize test waits for a stable grip position and completed layout before measuring. It retains the same required width/height increase and does not ignore failed resizing.


## Visible labels, iframe spacing and desktop

Shared `account-shell.js` maintains visible Search/Account captions and English/Ελληνικά labels on root/imported pages and language changes. `ui.js` removes the duplicate Account launcher from the grid. `account-shell.css` gives equal hit areas and a Search border; below 760px the header uses two rows, 112px height and matching content offset. Desktop stays in one row. SVGs remain 24px.

The standalone TXT button's 105px bottom spacer is removed only in embedded Account, inside the original `account-template` CSS layer so legacy important rules cannot override it. Embedded content retains 12px bottom padding without disabling notes scrolling.

The reflection paraphrases [Epictetus, Enchiridion 1](https://dcc.dickinson.edu/epictetus-encheiridion/chapter-1). His account of judgment/choice is distinguished from DedSec's modern application to code, permissions and shared data. Do not promise complete technical control or attribute a technology quote to him. No source link appears on the homepage.

Checks cover 320/390px and 1280/1440px, themes/locales, home/guides/knowledge/lessons and account UI. They verify visible labels, Search border, no duplicate Account launcher, fully visible controls and desktop overflow. In an embedded portal, scroll to the end of rewards: expect a small inset instead of the legacy spacer, with no content cut off. Roll back the commit and rebuild Test; Worker, D1 and secrets are unchanged.

The shared navigation updater applies the Search border and 13px language text with inline important to survive legacy CSS resets. Others contains only Cookies and Save DedSec Project; its regression test requires two tiles.

Desktop screenshot review found legacy copy controls covering command text. Imported `.code-container` elements now place the button in a separate row above code, with bounded wrapping for long commands. Chromium checks their rectangles do not overlap on mobile and desktop.

The full imported-page sweep now requires the first navbar action (Search) to have its 1px frame, matching focused tests. Other actions remain borderless.


## Centered title, complete controls and post-deletion return

On mobile, symmetric brand columns (logo / title / equal empty column) center the title text itself in the viewport. `#home-title` explicitly aligns centrally. `account-shell.js` adds Theme/Θέμα beneath the theme SVG and a globe SVG above English/Ελληνικά, retaining exactly one icon/caption after theme or language changes. Presentation lives in `account-shell.css`.

After successful DELETE, `account-live.js` clears the in-memory draft and attempts local cleanup on this browser, displays translated success and a homepage link, then returns to the selected profile homepage after 3.5 seconds. An embedded portal sends only `dedsec-account-deleted` with its existing bridge nonce; the parent checks exact origin/source/nonce and navigates the outer page. The account path is never reloaded without its query. Local cleanup failure cannot undo completed server deletion. A rejected DELETE displays no success and does not redirect. Copies in other browsers and exports are independent.

Chromium checks centered titles, four SVGs and captions across themes/locales. Disposable simulated accounts exercise rejected and successful DELETE, CSRF, no raw password, translated confirmation and final homepage navigation without a 404. The trusted iframe deletion message is also exercised. No real account is deleted. No Worker, D1 or secret change is required. Roll back the frontend commit and rebuild Test; this is not a restoration of deleted personal data.

The deletion fixture waits for each DELETE response before changing its simulated outcome, so a prior error toast cannot stand in for a newly rejected request.

