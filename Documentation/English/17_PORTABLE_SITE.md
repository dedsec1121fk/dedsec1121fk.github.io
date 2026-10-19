# Portability, previews, sitemap and AI index: release instructions

## Verified repositories and domains

| Profile | GitHub repository | Public base | Indexing |
|---|---|---|---|
| `main` | `dedsec1121fk/dedsec1121fk.github.io` | `https://ded-sec.space/` | Public |
| `test` | `dedsec1121fk/Test` | `https://dedsec1121fk.github.io/Test/` (default GitHub project Pages path; override when actually different) | Noindex staging |
| `backup` | `sal-scar/ded-sec` | `https://ded-sec.online/` | Public backup |

**Use the same source package in all three repositories.** The static HTML *build artifacts* cannot have byte-identical canonical and Open Graph URLs across different hostnames because crawlers need fully qualified URLs in the raw HTML. The build profile creates the correct URLs for each deployment automatically. No copying files manually into the HTML head, no app-wide hard-coded production hostname.

## Build and deploy

From the repository root, with Python 3.10+ and optional `mistune` for full rendered markdown:

```sh
python3 -m pip install mistune==3.2.0
python3 scripts/build_portable_site.py --target main --output .site-publish
python3 scripts/test_portable_site.py --output .site-publish
```

Choose `--target test` or `--target backup` for the other sites. On GitHub Actions, `--target auto` reads `GITHUB_REPOSITORY` and fails rather than guessing if run against an unknown repository. Override with `--site-url https://actual-host.example/path/` if the configured Pages URL is different. Set `SITE_TARGET` and `SITE_URL` via environment if preferred; do not include trailing query strings.

### Cloudflare Pages — main and backup

For `ded-sec.space`, connect the main website repository to Cloudflare Pages and set the build command to:

```sh
python3 -m pip install mistune==3.2.0 && python3 scripts/build_portable_site.py --target main --output .site-publish && python3 scripts/test_portable_site.py --output .site-publish
```

For `ded-sec.online`, use the same command with `--target backup`. Set **build output directory** to `.site-publish` and **root directory** to the repository root. Add the corresponding custom domain in Cloudflare; DNS/SSL are configured there and are not modified by these files. Cloudflare Pages does not run GitHub Actions as its build step; you must configure this build command in Cloudflare Pages. The included GitHub workflow validates all repos but automatically runs the GitHub Pages publishing steps only for the Test repository.

### GitHub Pages — Test

The included workflow detects `dedsec1121fk/Test`, generates previews and sitemap under `/Test/`, and deploys the resulting `.site-publish` directory to GitHub Pages if enabled. The Test robots file disallows indexing and its HTML pages contain `noindex` tags. Verify the actual Pages deployment URL in GitHub settings. Adjust the optional `SITE_URL` if it is not the default project path.

### Manual, Termux, Windows or Linux

Build into `.site-publish`, then serve that directory: `cd .site-publish && python3 -m http.server 8765`. The links to local assets, imported static pages and archived source examples are relative and continue working when accessed from a local server. Link-preview bots require a real reachable HTTPS host and will not fetch a `file://` URL.

## Generated files, previews and titles

- Root `index.html`: unified DedSec Project homepage. Legacy `/Pages/...`, `/el/Pages/...` and assistance routes remain as physical aliases. The integrated UI also retains its `/dedsec/...` internal paths.
- Every static HTML page receives *one* canonical URL, a page-specific HTML title and description, Open Graph `og:title`, `og:description`, `og:url`, localized OG locale, and Twitter large-image metadata using the existing 1200×630 JPEG preview image.
- Every indexed learning/reference card has a stable HTML sharing page, `/learn/en/ID.html` or `/learn/el/ID.html`. These pages expose full human-readable content and use links back to the interactive knowledge interface. Share these static URLs rather than `#read:ID` fragments: crawlers cannot distinguish hash fragments as separate HTML pages.
- `/sitemap.xml` contains the reachable public pages and learning previews, with translated alternates for actual matching static pages. The Test sitemap points to its own URL but is **not** submitted for indexing.
- `/robots.txt` allows public main and backup pages, and disallows the Test environment.
- `/llms.txt` describes the real DedSec project and directs readers to selected EN/EL guides; `/llms-full.txt` enumerates all indexed EN/EL records. These are discovery aids, not a guarantee AI systems will index the content.
- `/deployment-manifest.json` records the chosen domain and counts. The publisher never substitutes test.example URLs into production cards.

## QA before promotion

`python3 scripts/audit_knowledge_depth.py --strict`, `python3 scripts/test_portable_site.py`, and the browser audit must pass; check a few cards in social preview services *after* the real site is live (bots cache independently). All links and images in Open Graph markup are **absolute**, while internal navigation and asset links are **relative** where feasible. An HTTPS metadata URL cannot be validated remotely until the target is deployed.

Do not set staging to indexable, add private personal information to AI files, remove attribution/licensing or bypass the safety guidance in the source guides. The source remains proprietary except explicitly licensed third-party content.
