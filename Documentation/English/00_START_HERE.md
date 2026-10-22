# DedSec Project maintenance reference

Current architecture: 21 October 2026. Read `../RULES.md` before changing files. Only `dedsec1121fk/Test` is authorized for this work; main production and backup are separate deployment targets.

Start with [the system map and reconstruction runbook](09_COMPLETE_MAINTENANCE.md). It identifies source files, public build output, private services, prerequisites and recovery dependencies. Follow [human maintenance](01_HUMAN_MAINTENANCE.md) for normal edits, [AI maintenance](02_AI_MAINTENANCE.md) for an agent handoff, and [build and release](03_BUILD_AND_RELEASE.md) for exact local/CI checks.

Specialist references:

- [Portable hosting and crawler output](17_PORTABLE_SITE.md): deployment profiles, canonical aliases, social cards, sitemap and LLM files.
- [Search, startup and reader](19_FIELD_NOTES_AND_READER.md): whole-site paragraph search, highlighting, deferred knowledge and basic-page readiness.
- [Private accounts](21_PRIVATE_ACCOUNTS.md): authentication, D1 schema, 300 total accounts, 444 daily unique authenticated users, date of birth, TXT workspace, referrals, protected downloads and email prerequisites.
- [Publication audit](20_PUBLICATION_AUDIT.md): inspect generated output and interpret validation limits.
- [Content rules](05_CONTENT_AND_NO_DUPLICATES.md), [depth checks](15_KNOWLEDGE_DEPTH_AUDIT.md) and [catalogue review](18_COMPLETE_CATALOGUE_REVIEW.md): paired authored lessons and duplicate detection.

Earlier numbered chapters also record historical implementations and audits. For present architecture, paths, counts, loader and deployment instructions, the current runbook and specialist chapters above take precedence over historical examples. Do not revive an old five-second loader, missing-source migration gate, 21-tile layout, or root-level `assets/` paths. Website source assets live below `DedSec-Project-Website/`.

The README is the bilingual, closed-by-default entry point. TikDev is an integrated website page. Public source is sufficient to rebuild public pages; private database contents, keys, original reward scripts and provider authorizations are separate recovery dependencies. A successful static build does not establish that live accounts or email delivery work.


- [Account release / Έκδοση λογαριασμών — 2026-10-22](24_ACCOUNT_RELEASE_AND_PRODUCTION.md)
