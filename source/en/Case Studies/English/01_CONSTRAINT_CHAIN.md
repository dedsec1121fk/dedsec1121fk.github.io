# Case study: one change, five hidden constraints

**Illustrative scenario, not a transcript:** a learning tool must run offline on a phone. Search must be tap-driven, available in two languages, and cheap to maintain.

**Wrong first attempt:** publish an online website with an English index. The developer says it is “done” because the browser displays a search bar.

**Better reasoning:** translate requirements into five tests: airplane-mode open; no-terminal input; Greek query result; English query result; index refreshed after editing a lesson. Build a static local HTML search page and keep text sources separately. Use Python only as a maintenance aid.

**Regression discovered:** new lessons were committed, but the generated index was stale. The fix is not more search UI. It is index regeneration and a consistency check comparing indexed paths with source paths.

**Lesson:** features, data generation, deployment and verification are one continuous chain. A feature is unfinished if the chain breaks after editing.
