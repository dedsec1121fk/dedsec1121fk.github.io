# AI handoff contract

Read `Documentation/RULES.md`, `00_START_HERE.md`, the current system map and the specialist chapter for the requested change. Confirm the actual remote branch head and working changes before writing. Inspect applicable `AGENTS.md` files. Scope is `dedsec1121fk/Test` unless the owner explicitly authorizes another repository; a production URL in the footer is not authorization to write there.

First distinguish authored source, effective overlaid knowledge, generated public output and private runtime data. Source lives in `DedSec-Project-Website/`, `Developer's Mind/`, `account-service/`, `scripts/` and `Documentation/`. Do not edit `.site-publish` as the permanent fix. Never replace the repository with a scaffold, rerun import helpers blindly, delete unfamiliar archives or restore files the owner removed.

Trace a change end to end. A registration field needs EN/EL HTML, client JSON, server validation, explicit SQL columns, a forward migration, privacy/terms and tests. A quota change needs SQL policy, server and client constants, counters and documentation. A search change needs extraction, normalization/ranking, destinations, highlighting and generated metadata checks. A theme change must cover root and imported page families. Use existing components rather than building a second copy.

Run targeted checks locally, then the full release suite once for a functional batch. Maintain stable IDs, links and bilingual semantics. Automated overlap checks do not prove perfect translation or factual accuracy; state evidence precisely. Record which browser environments were exercised and which were unavailable. Do not claim a successful Actions run from a different commit.

Never print or commit secrets, credentials, cookies, private notes or original reward script plaintext. Public encrypted catalogue bytes are not an authorization boundary without server-side download checks. Preserve existing Worker secrets by inheritance during version updates. Do not manufacture email verification or bypass Turnstile to make a demo appear live. Test-only fixtures must stay in the test harness.

Deliver the exact commit, changed behavior, documentation entry point, checks and unresolved service prerequisites. Preserve Git history. Static Pages and the Worker are separate releases: verify both. Database migrations and private secret recovery are separate from a Git rollback. Ask the owner only for a genuinely missing decision, credential connection or action outside authorized scope; complete independently reviewable work first.
