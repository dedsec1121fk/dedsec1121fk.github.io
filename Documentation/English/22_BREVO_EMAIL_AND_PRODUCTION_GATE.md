> Current release: [account behavior and production promotion](24_ACCOUNT_RELEASE_AND_PRODUCTION.md). Earlier dated observations below are historical.

# Brevo email preparation and production migration gate

Current source of truth: Test source and chapter 23. The owner confirmed Test email receipt. Checkpoints below record earlier stages, not the current Worker version or delivery of the new email-change flow. Production promotion was authorized on 22 October 2026; backup changes remain separately scoped.

## Current verified state

On 21 October 2026 the account-wide cloudflare_api_key connection verified access to Pages, Workers, D1 and Email Routing. Earlier 403 errors came from the previous restricted connection and are resolved. The apex CNAME still targets dedsec1121fk-github-io.pages.dev; www still targets dedsec1121fk.github.io.

Brevo authenticated ded-sec.space; contact@ded-sec.space is an active sender. SPF, DKIM and DMARC passed on the owner-only outbound test. Cloudflare Email Routing is ready, with one exact contact@ded-sec.space rule forwarding to the verified owner Gmail. A second test addressed to contact@ded-sec.space reached the owner's Gmail INBOX, independently confirming inbound forwarding. Required Cloudflare MX/SPF records are installed. No paid plan was activated.

The owner explicitly requested deletion of the duplicate Pages project test (test-dn3.pages.dev). It was deleted successfully. A subsequent project listing contains only dedsec1121fk-github-io, serving ded-sec.space. The GitHub Test repository and the account Worker/database are retained because they are still used.

## Source and configuration

account-service/mail.mjs contains provider selection and request formatting. MAIL_PROVIDER=brevo uses https://api.brevo.com/v3/smtp/email with api-key authentication. MAIL_FROM must be DedSec Project <contact@ded-sec.space>. From and Reply-To both use the company address. The Gmail destination must never appear in the message payload. Resend remains the default only for compatibility with previously deployed bindings when MAIL_PROVIDER is absent. Unknown providers fail closed.

ACCOUNT_PUBLIC_ORIGIN is the HTTPS origin of the account Worker. It is not the static website origin: the account session and verification endpoint must stay on the same account service. Only a bare HTTPS origin without credentials, query, fragment or path is accepted. Configure it explicitly before promoting the account service. The existing Test origin remains the compatibility default. Links no longer contain the DedSec Test label in their body.

worker.mjs retains the existing quota, rate limits, one-hour token expiry, hashed token storage, account binding and single-use confirmation. Provider errors and network failures delete the newly issued token and return email_unavailable. Neither registration nor deployment sends verification mail automatically.

scripts/setup_account_email.py and .github/workflows/account-email.yml still target only Test/main and its existing Worker. They configure MAIL_PROVIDER, ACCOUNT_PUBLIC_ORIGIN, MAIL_FROM and MAIL_API_KEY. Keys remain private Actions/Worker secrets. Deploy the new code before applying these bindings. Partial legacy bindings require replace_existing=true and matching provider credentials; the script refuses an implicit mixed-provider migration. Sequential secret updates are not atomic; perform replacement during a controlled maintenance window and verify status before reopening verification. This workflow is not a production deployment workflow.

## Activation sequence

1. Verify account-level Pages, Workers, D1 and Email Routing access using read-only requests. Snapshot the existing project configuration, domain associations, source commit and database bindings. Keep secret material private and out of snapshots published to GitHub.
2. Retrieve the pending domain's actual DNS values from Brevo; never copy example DKIM keys. Prepare only the returned brevo-code, two DNS-only DKIM CNAMEs and DMARC TXT. Review DMARC aggregate reporting before enabling it: the suggested rua address sends aggregate reports to Brevo. Preserve any existing DMARC policy rather than overwriting it.
3. Configure Cloudflare Email Routing for contact@ded-sec.space to the verified destination fkgamesbusiness@gmail.com. Destination verification must finish before enabling forwarding. Use the MX/SPF records returned by Cloudflare. Maintain a single SPF TXT policy per hostname; combine approved senders rather than adding competing SPF records. Do not change web CNAMEs or nameservers.
4. Authenticate the domain in Brevo. Only after verification create or confirm the DedSec Project sender at contact@ded-sec.space. Send an explicitly scoped delivery test to the owner, inspect DKIM/DMARC and full message headers, and test a reply through the forwarding address. An API acceptance response alone is not proof of inbox delivery or Gmail privacy.
5. For normal Gmail replies, configure Send mail as with Brevo SMTP, port 587/TLS, the Brevo SMTP login and an SMTP key. Set both default From and Reply-To. A Brevo API key is not an SMTP key. Account connection to ChatGPT alone does not configure this Gmail alias.
6. Configure the intended account Worker with the verified sender, Brevo key and its own public origin. Exercise verification using an owner-controlled account. Test provider failure and expired/reused tokens before enabling real referrals. Keep recovery-code password reset available; email-password-reset is not implemented by these email changes.

## Production transfer and Test retirement

Production currently lacks the account-service source present in Test. Prepare the complete portable source tree from Test at a fixed commit, build with the main profile, audit links/assets/canonical sitemap and LLM exports, and review the production diff before publishing. Keep rollback material for the current main commit and Cloudflare project configuration. Do not replace production using a partial Git tree.

Decide whether production will use a dedicated Worker/database or a reviewed migration of the existing service. Preserve necessary secrets and data; never silently copy test accounts into production or delete the only copy of account data. Set production account configuration and Turnstile hostname approvals before testing the main account overlay. Build and validate backup from the same source without changing its hosting until its own release is ready.

Retire only the confirmed Test Pages project, Test-only email templates/webhooks and unneeded Test service resources after production website, accounts, notes, recovery and email tests pass and dependencies are checked. ded-sec.space is the shared production sender domain, not a Test-only Brevo resource; keep it. Never delete the Test GitHub repository as part of hosting cleanup. Remove obsolete Test access only after the production transition succeeds.

## Verification

Run node scripts/test_account_mail.mjs and node scripts/test_account_service.mjs with Node 24, plus python3 -m py_compile scripts/setup_account_email.py. The mail test mocks providers; the service test uses SQLite and mocked provider/Turnstile responses. They verify formatting and failure behavior, not live DNS, inbox delivery, Gmail alias setup or deployment. The portable validation workflow includes both Node suites.

## Activation checkpoint — 21 October 2026

The two DNS-only DKIM CNAMEs, Brevo verification TXT and a single DMARC TXT have now been installed. DMARC uses v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com so aggregate authentication reports go to Brevo. Brevo confirmed successful domain authentication, and contact@ded-sec.space is an active sender. One owner-only test was accepted and marked delivered by Brevo; Gmail independently shows it in INBOX from DedSec Project contact@ded-sec.space. Incoming forwarding is now verified. Gmail Send mail as, dedicated Worker mail credentials and production migration remain pending. Web CNAMEs remain unchanged. This checkpoint supersedes the pending-domain description above; it does not claim the whole setup is finished.

## Live Test Worker checkpoint

Version bce675b8-0664-4a6c-b83d-e97ef3b61b92 was uploaded and deployed on 21 October 2026 (deployment 628372df-7b9d-4fef-a0eb-028f407ddcf4). It uses the reviewed Test commit 8054421dd573aa3e440f645fa75323d37aaf78a9 modules and explicitly inherits all seven existing bindings from deployed version 4467ab41-22c2-4f99-b9a8-c4852ab5e4cc. nodejs_compat enables the source's node:crypto timingSafeEqual import. Cloudflare compiled the module graph successfully. No database migrations or production website changes were made.

Live checks returned HTTP 200 for status and both language portals. Status reports mode active, connected true and mailReady false, as expected without MAIL_* credentials. Local account-service and provider-adapter tests pass. Configure the four documented MAIL_* / origin bindings securely before testing live account verification; never extract the Composio-managed credential or paste keys in chat. The Brevo connection can send through ChatGPT but does not provision the Worker secret or Gmail SMTP alias.

## Adult registration and compact account window

The account window minimizes to a 56px square restore button without reloading its iframe or discarding drafts. Counters share a compact row. Full account terms are maintained once in the bilingual website privacy policy, linked by the registration checkbox. New registrations require ages 18 through 130 inclusive, using the Athens calendar day. Terms version is 2026-10-21-v3.

Migration 0004 widens the database age constraint. It is intentionally guarded for the currently empty Test database and refuses to run if any account exists. Apply it as one atomic batch before deploying this Worker version. For a populated installation, prepare a separate data-preserving migration instead; never remove the guard. Existing auth bindings and D1 are retained. MAIL_PROVIDER, MAIL_FROM and ACCOUNT_PUBLIC_ORIGIN can be configured without credentials; MAIL_API_KEY must be entered privately in Cloudflare by the owner. Gmail Send mail as remains a separate SMTP-key setup.


