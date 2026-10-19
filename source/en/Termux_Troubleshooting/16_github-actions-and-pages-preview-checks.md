# GitHub Actions and Pages: validate previews while controlling workflow minutes

## Cause and symptoms
GitHub Actions minutes are consumed by runner time, not by local linting. A change may also publish through a separate host such as Cloudflare Pages even if the repository commit contains [skip ci]; that marker is honored only by workflows configured to recognize it. Distinguish a successful static export from a successful live deployment and always test the generated entrypoint and relative asset paths.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
git status --short
git diff --check
python -m compileall -q scripts  # only if scripts exist
# If your project has local validation:
# python scripts/validate.py
# Inspect GitHub Actions workflow filters before relying on [skip ci].
# Check index.html and href/src paths before publishing.
~~~

## Evidence-based repair
Keep test and production branches distinct. Inspect .github/workflows triggers, path filters and required checks, and use local tests for fast feedback. When a workflow is necessary, run one targeted job rather than repeated full builds. Save generated artifacts only when needed; avoid uploading caches or huge test bundles automatically. Verify the resulting commit SHA and deployed URL so stale previews are not mistaken for new content.

## Hands-on lab
Create a local fixture HTML page with a missing relative script and run a link check. Repair the asset path, retest locally, then inspect whether the test-site deployment matches the intended commit. Record the GitHub Actions minutes consumed, if any, without pushing to production.
