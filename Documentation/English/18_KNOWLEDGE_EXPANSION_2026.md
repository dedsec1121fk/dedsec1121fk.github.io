# DedSec Project knowledge expansion — editorial and maintenance notes

## What changed in this source package

This expansion adds **35 distinct paired learning topics** (35 English guides and 35 Greek guides), with original language-specific explanations, runnable or inspectable code, boundary conditions, and explicit validation criteria. It retains the earlier curated archive, the separate Termux troubleshooting catalogue, the original Hacking Guide, and the three main/Test/backup portable website profiles. It also replaces **44 merged-content catalogue headings in each language** that previously began with the automatic label “Topics:”. The revised labels describe the real material they contain; lesson identifiers and file paths are unchanged.

The new work covers Termux package mirrors, storage, Android background restrictions, Python native dependencies, proot; Linux permissions, storage exhaustion, services, DNS/TLS and SSH; Windows command resolution, Android installation, Git recovery and low-cost CI; safe static analysis of binary headers, ELF/PE, .NET, JavaScript bundles, APK, PCAP and archive containers; software supply-chain and secret handling; and working exercises for Python, JavaScript, Bash, Rust, C and SQLite.

## Reliable sources, versions, and consent

Some examples are deliberately **illustrations**, not reports of executions on phones or proprietary runtimes. Commands can vary with software releases. Review the official maintenance sources before changing a real machine:

- Termux package management: https://github.com/termux/termux-packages/wiki/Package-Management
- Python virtual environments: https://docs.python.org/3/library/venv.html
- Android APK signatures: https://source.android.com/docs/security/features/apksigning
- GitHub Actions security: https://docs.github.com/en/actions/how-tos/secure-your-work
- GitHub artifact provenance: https://docs.github.com/en/actions/concepts/security/artifact-attestations

Read-only reverse-engineering labs must use files you own or have permission to inspect. Do not execute unknown binaries for curiosity, publish secrets, or bypass third-party authentication. Every worked example should separate “expected” from “observed” and name the environment in which it was tested.

## Editing one lesson correctly

1. Open the relevant Markdown under `Developer's Mind/Keep Programming Alive/English/` or `Greek/`. Identify the corresponding source record by its stable `p` path inside `DedSec-Project-Website/data/en.js` or `el.js`. Both must contain **exactly the same effective Markdown text**, aside from the trailing file newline.
2. Maintain a matching lesson in the other language under the same logical topic key. Translate the explanation, not the tool's literal keywords, and use an accurate natural heading. Do not append a repeated generic template paragraph just to pass length checks.
3. Run `python scripts/audit_knowledge_depth.py --strict`, `python scripts/audit_near_duplicates.py`, `python scripts/audit_offline_links.py`, `python scripts/validate.py`, and `python -m unittest discover -s scripts -p 'test_*.py'` from the repository root. Inspect any failures instead of weakening the gates.
4. Test the build profiles with `python scripts/build_portable_site.py --target main --output /tmp/dedsec-main`, then `python scripts/test_portable_site.py --output /tmp/dedsec-main`. Repeat for `test` and `backup` with separate folders. Deployment profiles must generate their own absolute metadata and sitemap origins.
5. For a runtime-dependent example, test with its actual compiler/OS and record evidence. If unavailable, label it “not executed” in the quality report. A syntax check is not an end-to-end test.

## What the automated gates do and do not prove

The editorial audit checks indexed Markdown depth, translation-key parity, empty sections, boilerplate and repeated substantive paragraphs. The near-duplicate auditor compares four-word prose shingles within each language and flags pairs above a Jaccard similarity of 0.72. Static site validation checks links, per-page metadata, crawler previews and sitemap destinations. None of these checks certifies the factual correctness of every niche language guide, full accessibility, physical Android/Windows functionality, or real Internet social previews.

## Release scope and future maintenance

This ZIP is a **portable source package**, not an already-deployed production website. Maintain a single curated source and rebuild separately for `dedsec1121fk/dedsec1121fk.github.io`, `dedsec1121fk/Test`, and `sal-scar/ded-sec`. Do not hardcode the main domain into reusable links or use GitHub Pages deployment assumptions for a Cloudflare setup. Keep evidence for every future addition in a machine-readable inventory and never claim completeness solely from guide counts.
