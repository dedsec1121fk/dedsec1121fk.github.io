# Spend CI minutes on platform-dependent checks, not routine editing

## Build a validation pyramid
Cheap syntax, link, schema and duplicate checks belong in a local script that a contributor can run before committing. Integration tests should use small deterministic fixtures. Reserve GitHub-hosted workflows for tests requiring an environment you do not have locally, such as a clean runner, browser binary or packaging on another OS. A job that automatically succeeds after disabling a failing quality gate is not evidence of readiness.

~~~sh
python -m compileall -q scripts
python -m unittest discover -s scripts -p 'test_*.py'
python scripts/audit_offline_links.py
python scripts/audit_knowledge_depth.py --strict
~~~

## Preserve fault visibility
Make every required command return nonzero when it detects a violation; don't hide errors with `|| true` on release gates. If a staging-only audit is intentionally advisory, label its status separately from the production release decision. Do not launch expensive jobs for each one-line spelling correction: batch changes and run the complete suite at a meaningful checkpoint.

## Avoid dangerous automation side effects
Pin third-party actions to reviewed revisions where feasible, scope the workflow token to minimum permissions, and treat pull-request input as untrusted. Separate staging publishing from production credentials. For a private Test workflow, do not accidentally push edited source into another repository or publish a stale CNAME. Keep deployment manifest URLs tied to the selected target.

## Define a review record
Report the source commit, suite command, start/end time, platform, failed tests and artifact hashes. A green page deployment plus a red editorial audit is **not** a finished knowledge release. Keep a reproducible manual command for each CI job so spending the limited Actions allocation has a clear benefit.

Reference: https://docs.github.com/en/actions/how-tos/secure-your-work
