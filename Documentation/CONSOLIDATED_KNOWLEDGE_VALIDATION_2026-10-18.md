> **Historical checkpoint, not the current offline release procedure.** The current downloadable ZIP is validated entirely offline. Use `Documentation/OFFLINE_QUALITY_REPORT.json` and `Documentation/OFFLINE_CURATION_MANIFEST.json` for the current counts, redirects, pass results and limitations. This ZIP does not modify GitHub or production.

# Test Knowledge Base — Consolidated Editorial Validation

**Scope:** DedSec Project Test repository, main branch only. Production unchanged.

This checkpoint initiates one combined build after source-specific rewriting, removal of the obsolete padding generator, conservative prose cleanup, and deterministic pairing-based curation. The existing Hacking Guide, offline source examples, TikDev integration, credits and licensing remain in place.

The build must run, in order: author-reviewed bilingual lesson integration, safe cleanup, paired editorial selection with manifest, exact ID and source parity audits, strict lesson quality gate, static website validation, mobile/desktop Chromium checks, and staging deployment. The generated manifest identifies every removed original index ID and path; Git history remains available.

**Release decision:** A green deployment alone is insufficient. Mark the knowledge release complete only if the strict editorial gate also says PASS and the website/offline tests pass. If a gate fails, report real numbers without describing an incomplete archive as finished.

**GitHub Actions allowance:** 200 minutes. This is the single requested consolidated CI run; preparation commits used [skip ci].

## Replacement validation
The first workflow stopped before publishing because its locale-ID normalizer incorrectly handled IDs beginning with `en-` or `el-`. That defect was corrected and covered by dedicated regression tests. This rerun is a replacement full validation of the same consolidated curation, not a new content-expansion pass.
