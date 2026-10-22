# Account release and production promotion — 22 October 2026

This is the current account release guide. Earlier dated deployment observations are historical. The owner authorized promotion from Test to https://ded-sec.space/; backup deployment is outside this release.

## Account behavior

Registration asks for date of birth, not a second manual age. The server validates the calendar date and computes age on the Athens date (18–130). The stored age is age at registration, not current age. A legacy client may still send age, but it must match the server calculation.

A verified current email is required for password changes, recovery-based password resets and email changes. These restrictions are enforced by the API, independent of disabled UI controls. Email changes continue to require approval from the old address and verification of the new address. Invalid recovery proofs do not reveal verification status.

Deletion requires the current password. The database deletion commits first and cascades through account data. A bilingual confirmation email is then requested from the configured provider, without notes, passwords, tokens or recovery codes. Delivery has a ten-second timeout and shares the service mail quota. An email outage or exhausted quota does not restore the deleted account: the success screen reports the notification failure and returns to the selected website homepage. Provider acceptance is not proof of inbox delivery. The deleted address is used only for this immediate request; no deletion-email outbox is retained. Other browser copies and exported files are independent.

## Referrals and gifts

Users can copy the referral code alone or the complete invitation URL. Registration includes an optional editable referral-code field; an invitation URL prefills it. Codes are 32 hexadecimal characters, normalized to lowercase by the UI. The API rejects unknown/invalid codes and records the invitation during account creation. A successful registration reports whether a referral was attached; entering a code alone does not immediately unlock rewards.

The account displays pending and qualified referrals, unlocked script downloads and the number of additional qualified referrals needed for the next gift. Each successive script requires three more qualified referrals (3, 6, 9, 12). Both accounts must remain active. Qualification requires distinct verified email identities, separate eligible signup networks, at least 24 hours and activity on two Athens dates. Email aliases/shared networks do not qualify; pending referrals expire after 30 days. Downloads recheck eligibility on the server. Refresh rewards after qualification; the visible profile also refreshes periodically.

## Publication and maintenance

Use one portable source, build Test with `--target test` and production with `--target main`. Production publishes the portable source through Cloudflare Pages: build with `--target main --output .site-publish`, then run the portable-site and publication audits; the output directory is `.site-publish`. Install `mistune==3.2.0` in the build environment. Legacy generated repository-root copies are not the deployment input. Never copy the Test generated output unchanged. Keep Worker DB/secret bindings inherited and preserve the previous Worker version for rollback. No new database migration or new secret is required by this release.

Rebuild the public search index, sitemap.xml, llms.txt, llms-full.txt and startup manifest. Discovery files use the canonical production origin; Test stays noindex. Static shareable pages must have a title, description, favicon and Open Graph/Twitter preview metadata. Private API responses and token links are not public shareable content and remain no-store/noindex. Third-party destination previews are controlled by their owners.

Run service/mail tests with mocked email transport, schema/core tests, source validation, portable publication audits and the desktop/mobile browser audit before promotion. Do not infer inbox delivery from mocked tests. After release, verify the live deployment commit, account portal assets and public metadata. A user may need to refresh an already-open tab; no secret rotation, database reset or manual age entry is needed.

## Consent and production mail checks

The consent dialog belongs only to the top-level home screen and waits for startup readiness. Fresh visits to Account, its separate-origin iframe and other subpages do not create a consent dialog. The home preference controls optional homepage requests; account session cookies and optional note storage remain separate. The legacy imported banner must not create another consent interface. Browser regressions cover a fresh home visit, retained choice after reload, bilingual separate-origin Account frames and direct subpage visits.

Verification and both email-change stages explicitly retain `site=main` in production links. Mail tests cover the production profile as well as provider errors. Sender activation, SMTP enablement and configured Worker bindings are configuration evidence; they are not proof of delivery of a particular message.

## Diagnosing sign-in without a visible result

Turnstile “Success” confirms the anti-abuse challenge, not account authentication. A failed sign-in consumes its challenge and starts a fresh one; this must not hide the API error. Feedback is attached directly to the document body so embedded page containers cannot clip it. Visible toast styles must override embedded defaults: verify computed opacity, visibility, colors and viewport bounds with both embedded selectors present. Failed submissions also retain an error beside the form. Successful authentication does not restart Turnstile.

Use the registered email for sign-in; create an account first if none exists. Public errors deliberately avoid revealing whether an address is registered. Authorized service troubleshooting may check an exact-address count in the bound D1 database; never expose other users, password proofs, cookies or secrets. Preserve the portal query when signing out. If credentials are accepted but the browser rejects the session, offer the direct portal for the same site profile. Mock transport tests cover errors and re-login but do not certify a real user's password or inbox.
