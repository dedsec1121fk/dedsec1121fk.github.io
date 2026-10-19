# Privacy, attribution and link boundaries

Test is a staging site. Preserve `<meta name="robots" content="noindex,nofollow">` at every page entry point and never configure `CNAME`, `sitemap*` or `llms*`. HTML, CSS and local JS need no backend account, telemetry, remote search API, cookies or AI model. Bookmarks and language/theme preferences are stored locally in browser storage; unavailable storage must not prevent reading.

Original DedSec pages keep their attributed content and any applicable license notices; public outgoing links are explicit. Never rewrite links to impersonate the canonical domain. Production and Test are distinct: changes to Test must not modify official DedSec, Operation Nightfall, Developer Mind or the main website.

The website contains authorized security education, not permission to target third-party systems. Do not expose tokens, banking identifiers, credentials, contact lists, private files or user biographies in published JS datasets. Check for secrets in both `data/` and the optional source migration before making anything public. Honor all third-party licenses in the imported assets.

Supply-chain boundary: `scripts/import_dedsec.py` clones only the publicly readable canonical DedSec website and intentionally excludes its deployment configuration, tracking-oriented elements and domain-routing files. Audit imports before promoting them. Avoid auto-running downloaded programs. The `.py` and `.sh` suffixes on desktop icons are themed navigation labels, not executable software.