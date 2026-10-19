# Termux Git pull: preserve local edits before reconciling remote history

## What causes the failure
git pull combines fetch with merge or rebase according to configuration. It can stop because tracked files are locally edited, because the branches diverged, or because a textual conflict needs a decision. A non-fast-forward push is related to branch ancestry, not fixed by deleting the .git directory. The goal is to preserve both local work and newly fetched commits.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
git status --short --branch
git branch --show-current
git fetch origin
git log --oneline --graph --decorate --all -n 20
git diff --check
# After reviewing, choose merge or rebase deliberately:
# git merge origin/main
# Inspect conflicts, resolve each, git add, git commit.
~~~

## Repair in evidence-based order
Before merging, make a backup branch and commit or stash deliberate local work. Determine if the remote changed the same lines. Use git diff --ours and --theirs only after understanding their context (especially during rebase); never overwrite everything with one side by habit. If a merge is in progress, git merge --abort returns to the pre-merge state when possible. Reflog is a recovery aid, not a substitute for backups.

## Hands-on exercise
Create two disposable clones from a local bare repository, edit the same line independently and attempt pull. Resolve the conflict preserving the intended combined meaning. Verify git log --graph and run a project test before pushing; never force-push a shared main branch for this exercise.
