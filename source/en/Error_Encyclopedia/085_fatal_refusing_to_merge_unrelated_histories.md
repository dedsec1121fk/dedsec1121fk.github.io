# Git repository recovery and history diagnostics

## fatal: refusing to merge unrelated histories

### Meaning and differential diagnosis
Git reports unrelated histories when no commit is a common ancestor of the two tips. This happens when a local repository was initialized separately from a web-created remote, or when history was rewritten. Combining them can be valid, but only after checking whether the two projects really belong together.

### Reproduction / nondestructive inspection
Use an isolated test directory or an authorized service. Do not modify real remotes or production systems while diagnosing.
~~~sh
git remote -v
git fetch --prune origin
git log --graph --oneline --decorate --all -n 25
git merge-base HEAD origin/main || echo "No common ancestor"
# No mutation above except fetching remote objects.
# Only with verified intent and a backup:
# git merge --allow-unrelated-histories origin/main
~~~

### Interpret evidence and fix the cause
Inspect the root commits using git rev-list --max-parents=0 HEAD and the remote equivalent. Check remotes carefully to rule out a URL pointing at another project. Compare trees or README contents and choose one intended canonical history. If the repositories are unrelated by mistake, fix the remote rather than using --allow-unrelated-histories.

### Practical lab
Create two independent temporary repositories, each with one different commit. Verify merge-base fails, then try an intentional merge in a disposable copy and inspect the graph. Explain why a forced push would hide rather than reconcile the second line of history.

## detached HEAD

### Meaning and differential diagnosis
Detached HEAD means HEAD points to a specific commit rather than a branch reference. It is normal while examining an old commit or CI checkout, but new commits may become hard to discover after switching away if no branch points to them. Detached does not mean the repository is corrupted.

### Reproduction / nondestructive inspection
~~~sh
git status -sb
git symbolic-ref -q --short HEAD || echo "Detached HEAD"
git log -1 --oneline
# If you created a valuable commit while detached:
# git switch -c preserve-experiment
# Alternatively find it via git reflog before cleanup.
~~~

### Interpret evidence and fix the cause
Find what commit you are on with git rev-parse HEAD. Before switching, create a branch at the desired commit; do not confuse git switch -c (creates a branch) with git switch (moves to an existing branch). Reflog can locate recent otherwise-unreferenced tips, but garbage collection may eventually prune unreachable commits.

### Practical lab
In a disposable repository commit two changes, switch --detach HEAD~1, commit a third experimental change, create a named branch, and verify git branch --contains includes it. Demonstrate recovering the old tip with reflog without any force push.

## repository not found

### Meaning and differential diagnosis
A remote host may return repository not found for an incorrect owner/name, a deleted or renamed repository, or private content to which the current credentials have no access. Some providers deliberately avoid revealing a private repository's existence. The error alone does not identify which case applies.

### Reproduction / nondestructive inspection
~~~sh
git remote -v
git config --get remote.origin.url
git ls-remote origin HEAD
# For HTTPS test the exact known URL, not a guessed variant:
# git ls-remote https://github.com/OWNER/REPO.git HEAD
~~~

### Interpret evidence and fix the cause
Confirm the repository URL from an authorized browser session and check owner/name case and renames. Verify your credential helper or SSH key identity without printing tokens. Check installation/organization access for the connected account. Never paste access tokens into command-line URLs or logs. Retry only after distinguishing URL mismatch from permissions.

### Practical lab
Point a disposable local repo at a deliberately nonexistent repository name and observe the exit status. Then test a known accessible repository. Document why the failure does not prove that a private repository is absent.
