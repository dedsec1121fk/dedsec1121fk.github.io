# System map, reconstruction and operations

This is the current implementation map, replacing the chronological notes formerly in this chapter. All paths below are relative to the repository root. Public source is a static HTML/CSS/JavaScript application with a Python publication pipeline. Optional accounts run in a separate Cloudflare Worker with D1. `cloudflared` is a tunnel client; connecting Cloudflare does not turn static GitHub Pages into a database or provide unlimited email/storage.

## How the system was assembled

The existing DedSec project guides and their Greek counterparts were retained beneath `DedSec-Project-Website/dedsec/`. A shared homepage and presentation layer wrap those guides, the learning archive and integrated `TikDev.html`. Archived examples and authored bilingual expansions supply the lesson catalogue. Publication now generates portable static pages and crawler metadata from these local sources; it does not depend on re-downloading the original ZIP or cloning upstream during every build.

The interface uses shared navigation/theme/consent components instead of independent implementations per article. Knowledge is requested only when reading/searching. Basic-page readiness and a small verified offline cache avoid downloading the entire archive on entry. The optional account module adds a separate private origin, database-enforced limits and encrypted reward delivery without putting user data into the public site.

## Ownership map

| Source | Responsibility | Safe update point |
|---|---|---|
| Root `index.html` | Source-package entry redirect | Preserve query and hash |
| `DedSec-Project-Website/index.html` | Homepage shell, inline nav, stylesheet/script order | Keep critical loader early; knowledge declarations inert |
| `assets/ui.js` under website source | Launchers, groups, routes, reader, global search UI | Paired labels; stable IDs; escaped text |
| `assets/knowledge-renderer.js` | Article Markdown/code rendering | Preserve code and prevent unsafe markup |
| `assets/knowledge-search.js` | Query parsing, normalization and ranking | Phrase/filter/exclusion and typo fixtures |
| `assets/page-controls.js`, `.css` | Passages/highlights, Copy, Back, footer integration | One control per target; never execute copied commands |
| `assets/ui.css`, `galaxy.css`, `clean-skin.css`, `refinement.css` | Root appearance in declared cascade order | Inspect winning selectors; fixed galaxy; theme parity |
| `dedsec/Assets/merged-retro.js` and associated styles | Imported-page compatibility and shared navbar | Keep four inline actions visible on small screens |
| `assets/boot.js`, `offline-worker.js` | Resource readiness, progress and verified basic cache | No full knowledge preload; failure escape |
| `assets/cookie-consent.js` | Consent and permitted optional refreshes | Equal Accept/Decline; accurate privacy text |
| `assets/save-links.js`, Save page sources | Public Save DedSec resource list | Check actual URLs and translated descriptions |
| `TikDev.html`, `data/tikdev-weekly.json` | Integrated public GitHub discovery | Distinguish bundled data from online refresh |
| `data/*.js` | Deployable lesson records and enrichment layers | Read `scripts/knowledge_catalogue.py` and index script order first |
| `Developer's Mind/` | Anonymized archived examples/source material | Preserve provenance, no personal data |
| `scripts/build_site_search.py` | Extract public page passages into `data/site-search.js` | Regenerate after article/form/terms changes |
| `scripts/build_portable_site.py` | Public page aliases, lesson previews, raw links, SEO and asset versions | Build output is disposable |
| `scripts/startup_manifest.py` | Basic-page dependency allowlist and hashes | Keep data/learn/raw out of startup |
| `account-service/` | Private Worker, SQL policy, credentials and ciphertext catalogue | Follow chapter 21, preserve secrets |
| `.github/workflows/` | Test validation/Pages and weekly TikDev refresh | Read exact conditions/permissions before changes |
| `Documentation/`, `README.md` | Paired maintenance instructions and file index | Same commit as functional changes |

## Pages, navigation and visual contracts

The homepage groups 22 primary launcher entries and an Others group. Cookies, Save DedSec and account access belong to the existing Others UI. Founder projects are a collapsed section of the founder article. TikDev is part of the website, with public repository discovery as its online feature. External footer links do not authorize deployment to those repositories.

Root routes such as `#home`, `#library`, `#category:…` and `#read:ID` render into the shared application. Imported guides are physical HTML; build aliases preserve older `Pages/`, `el/Pages/` and Assistance URLs. Generated `learn/en/ID.html` and `learn/el/ID.html` are crawlable article previews. Do not create duplicate catalogue entries for those aliases.

Shared controls are Search, Theme, Language, Account. Back appears at the upper right inside non-home content and has a safe destination for direct links. Copy buttons reuse the existing guide treatment and read exact command text, with clipboard fallback and honest failure state. Titles use sentence case while preserving brand/program names. Final icon rows with one or two items are centered. Content/trust surfaces stay transparent with readable code/input contrast. Do not add Share/Preview or the removed bottom Main Website button.

Theme/language/consent are local preferences, not authentication. Inspect actual localStorage keys in their modules when changing them; notes, recovery codes and passwords must not enter those keys. Consent controls optional external refreshes, while bundled public content remains readable. Imported article localization and root labels must stay aligned. Navbar icons exist in HTML before scripts execute.

## Search, reader and startup data flow

The shell loads theme/readiness code and the current page's presentation dependencies. On published HTTPS/localhost, the startup manifest prepares only basic project pages and their required local assets. The loader reports resource progress, waits for fonts/images/styles and paint, and exposes Retry/Continue on failure. It uses a centered logo and colorful bar over a fixed galaxy. It has no artificial wait and no guarantee of zero lag on every device.

Opening knowledge or search loads the inert catalogue declarations sequentially, applies enrichment layers and normalizes the effective index in yielding batches. Search merges public website passages and knowledge. Supported query forms are tested in `test_knowledge_search.mjs`; examples include `"exact phrase"`, `lang:en`, `type:page`, `in:title`, `topic:website`, OR and exclusions. TikDev repository discovery is a separate online operation, not the homepage index.

Results preserve complete relevant passages. Public fragments carry the excerpt locator, not account content. `page-controls.js` maps normalized Greek accents/spacing back onto DOM ranges, opens enclosing details and scrolls/highlights the result. Plain text creation avoids injecting query markup. Lesson results use stable IDs; generated static pages and SPA readers must agree. The basic offline cache verifies resource hashes and activates only after its bundle succeeds. Requested knowledge may be cached by the browser; it is not proactively fetched as a complete offline archive.

## Recreate the public site from a clean checkout

1. Obtain the full authorized repository and its history: `git clone --branch main https://github.com/dedsec1121fk/Test.git`, then `cd Test`. Record the commit. Do not substitute an empty framework project.
2. Install Python 3.10+ and Node 24. Create the isolated Markdown environment and run the exact commands in chapter 03. Build with `--target test`, never infer a production target from a footer URL.
3. Inspect `.site-publish/deployment-manifest.json`: the Test base is `https://dedsec1121fk.github.io/Test/`, not the legacy source metadata host. Source social markers are replaced during build.
4. Serve the build over localhost HTTP and inspect home, imported article, both languages/themes, knowledge reader, whole-site search and static lesson preview. Verify Copy, Back, consent, details, fixed background and narrow layouts.
5. In the Test repository, select GitHub Actions as the Pages publishing source if not already configured. The included workflow requires Pages permissions and publishes the build after all checks. Verify the exact successful run and then open the real HTTPS Test URL.
6. Keep Test noindex. The builder generates `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` and preview metadata per deployment profile; inspect those generated files, not obsolete source-era URLs. Never include private user data in crawler files.

A rebuild needs no database to serve general public content. The static account page deliberately remains disconnected, with a memory-only TXT preview and a link to the private portal. Its disabled forms must not collect personal information on a static origin.

## Recreate or update private accounts

The current Test Worker is `dedsec-test-accounts`, hosted under `dedsec-project.workers.dev`. Its only portal routes are `/dedsec/Pages/account.html` and `/dedsec/el/Pages/account.html`; API routes begin `/api/account/`. D1 is bound as `DB`. `account-service/wrangler.example.jsonc` records the current Test identifiers and hourly cleanup schedule. Do not copy its D1 ID into an unrelated installation.

For a clean installation, create a Free Worker and D1 database in the owner's account; set a new Worker name/database ID and matching portal/static base URLs in configuration/code. Create a Turnstile widget for the exact portal hostname and expected actions `register`, `login`, `recover`. Apply migrations 0001, 0002 and 0003 exactly once and in order to the empty database. On the existing Test database, 0001/0002 were applied directly through the D1 API: apply only 0003 after schema inspection. Wrangler's `d1_migrations` ledger is distinct from our `account_schema_migrations`; never blindly ask Wrangler to reapply old migrations to an API-initialized database.

Use current Wrangler or the authenticated Cloudflare API. For explicit one-file execution from `account-service/`, use `wrangler d1 execute dedsec-test-accounts --remote --config wrangler.example.jsonc --file migrations/0003_account_capacity_and_birth.sql` only after proving 0001/0002 exist and 0003 is absent. Substitute the correct new database name for a fresh installation and execute its three files in order. Back up before schema writes, temporarily disable registration during migration, verify the ledger and `PRAGMA table_info(account_users)`, then deploy the matching Worker. This operation changes schema and must never target production by accident.

Configure `SERVICE_MODE`, `TURNSTILE_SITE` and D1. Required server secrets are `PASSWORD_PEPPER`, `HMAC_SECRET`, `TURNSTILE_SECRET` and, for rewards, `SPONSOR_KEY`. Generate strong independent keys privately on a new installation. On an existing installation, inherit the existing secrets when uploading a version; do not extract them or regenerate them. Preserve runtime compatibility settings and all bindings, because Worker version upload does not automatically copy them. The deployed modules are Worker, crypto, limits, ciphertext catalogue and the imported account core. Uploading a version is separate from assigning traffic to it. Keep logging free of personal data and maintain the hourly `17 * * * *` cleanup schedule.

The existing public catalogue was encrypted with an owner-held key. A new key cannot decrypt it. Reuse the matching private recovery key or rebuild the catalogue from owner-provided originals with `scripts/package_sponsors.py`. Its `--help` lists manifest/source-dir/key-file/output/release arguments; source files, manifest and key stay outside Git. For a new installation without those private materials, use an empty catalogue and keep rewards unavailable. Do not claim encrypted public bytes can reconstruct missing plaintext.

Optional verified email uses `MAIL_API_KEY` and `MAIL_FROM` for Resend. A connected Cloudflare account alone is insufficient. Verify the sender domain and connect a free email account before enabling real rewards. No paid Cloudflare outbound email plan is required or enabled by this application. Free providers impose quotas and may suspend requests; limits and current pricing must be checked before publication. Details, retention and failure behavior are in chapter 21.

## Operating and recovering the system

Keep a release record containing source commit, Pages run, Worker version, migration ledger and non-secret resource IDs. Keep secrets and encrypted private database backups in owner-controlled recovery storage separate from Git; the public repository is not a user backup. Test restore into an isolated database before relying on a backup. Notes exports are user-controlled TXT/ZIP; they do not restore credentials, referrals or sessions.

If registration stops at 300, deletion frees an existing-account place; the cap is not 300 lifetime signups. Daily activity is unique accounts per Athens date, not concurrent sockets. It remains capped at 444, independently of the smaller existing-account cap. The UI must show server counts or unknown, never invented demo activity. Storage is decimal 400 MB overall and 900 KB per account; 300 personal ceilings total 270 MB, leaving the global cap unchanged.

For a stuck loader, inspect failed local resources, startup hashes and console/network errors; use its failure controls. Do not fix it by loading all knowledge or hiding a failed theme. For missing search results, regenerate public passages and compare effective catalogue IDs, selected language/filters and data load errors. For stale styles, inspect generated content-hashed URLs and service-worker activation. For `portal_not_published`, confirm the static Pages run deployed account HTML and its fingerprinted config script is replaced by the Worker. For `email_not_configured`, connect the sender; never mark users verified manually as a public workaround. For conflicts, export the unsynced copy before reloading. For rewards, inspect real verification, referral age/activity and network qualification before inspecting encryption.

Roll back public changes through Git history and a new build. For account incidents, disable `SERVICE_MODE` or deploy a schema-compatible known-good Worker while preserving D1. Version 0003 adds a column, so the old positional `INSERT INTO account_users VALUES(...)` Worker is not compatible with new registrations: patch it to explicit columns or retain the new validated registration path. Do not remove DOB or drop user tables as a shortcut. Restore D1 only from a verified private recovery point with an explicit data-loss decision.

## Evidence and limits

The test suite uses real SQLite transactions locally and controlled Turnstile/email transports. Chromium checks source and generated UI with mock accounts, and produces screenshots. These checks establish specified behavior, not independent security certification, verified legal policy, perfect translations or guaranteed free capacity for every traffic pattern. Before public referral use, test real CAPTCHA signup, email ownership, two-day referral maturation and authenticated downloads in the owner-controlled environment. Keep any pending provider connection visible in the release report.

Official operational references: [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Worker version upload and inherited bindings](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/versions/methods/create/), [D1 recovery](https://developers.cloudflare.com/d1/reference/time-travel/). Pin dependencies and review official changes before future upgrades.
