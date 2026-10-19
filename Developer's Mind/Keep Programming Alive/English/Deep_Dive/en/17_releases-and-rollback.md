# Release rollback without deleting Git history

## What is happening
A release should identify the exact commit, verified tests, files changed and migration considerations. A GitHub Pages deployment can have a newer UI than the phone's cached assets.

## Practical investigation
Prefer git revert to undo a problematic published commit because it preserves the audit trail. Avoid replacing the entire branch without reviewing changes.

## Common traps
Document the rollback trigger before deployment, then retest links, language, accessibility and storage compatibility after reverting.

## Adaptable demonstration
```text
git log --oneline -5
```

## Revert code only after checking data compatibility
Suppose release B adds a new configuration field that release A cannot parse. Reverting the code from B to A may leave B's persisted configuration behind. A safe rollback plan states which data version remains readable, whether a migration backup exists and how the old application behaves if the new field is present. Test that state before release, not during an outage.

A normal revert adds a new commit containing the inverse change. Reverting a merge requires an explicit mainline-parent choice, so do not copy a one-commit command into that case without inspecting ancestry. Check the final tree and tests; the presence of a revert message does not demonstrate restored behavior.

Keep a release record containing source commit, generated-artifact hash, build configuration and deployment result. On a phone, distinguish the deployed version from a cached response using asset URLs/headers and an intentional reload. A successful workflow is evidence that the configured steps passed, not that every supported physical device was exercised.
