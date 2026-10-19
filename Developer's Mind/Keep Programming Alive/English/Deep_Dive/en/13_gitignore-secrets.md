# Gitignore, secrets and historical commits

## What is happening
A .gitignore rule prevents newly untracked files from being added, but it does not remove secrets already committed to a repository.

## Practical investigation
If a secret was published, revoke and rotate it immediately, then investigate the repository history. Removing the visible file alone is insufficient.

## Common traps
Keep configuration samples with dummy placeholders and store real keys in environment-managed secrets. Run local secret checks before push.

## Adaptable demonstration
```text
git status --ignored --short
```

## Prove the tracked/untracked distinction with dummy data
In a throwaway repository, create `sample.env` containing only `DEMO_VALUE=not-a-secret`. Add it to Git, then add sample.env to .gitignore. `git ls-files -- sample.env` still lists it because it was already tracked. Use `git check-ignore --no-index -v -- sample.env` to inspect the matching pattern independently of tracked status.

If the intended fix is to stop tracking a local configuration, review `git rm --cached -- sample.env`: it removes the index entry while keeping that local file, but a later commit still does not erase previous versions from history. Verify index and working-tree effects separately before committing. `git add -f` can override ignore rules for an untracked file, so ignore rules are not an access-control boundary.

For a real exposed token, revoke it at its issuing service before history cleanup. Copies may exist in clones, logs, artifacts or caches. Rotating a value and replacing a committed file are different tasks; testing a dummy fixture never requires publishing a usable credential.
