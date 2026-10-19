# Distinguish uncommitted edits from unreachable commits

## Inspect state before repair
`git status`, `git branch --show-current` and `git log --oneline --decorate -8` reveal three different facts: the working tree, selected branch and recent commit graph. A detached HEAD is valid when inspecting an older commit; it is not automatically data loss. If work was committed before an accidental reset, the local reflog may still reference it. Uncommitted edits are not generally recoverable through reflog.

~~~sh
git status --short
git branch --show-current
git log --oneline --decorate -8
git reflog -8
~~~

## Protect evidence before trying another reset
If an unexpected commit is visible in reflog, record its full SHA and inspect it with `git show --stat <sha>`. Create a recovery branch at that commit only after verifying it is the intended object. Avoid `git reset --hard` or `git clean -fd` until you know which tracked, ignored and untracked files they would affect. For an unsaved working tree, copy the entire project to another local directory first.

## A safe practice experiment
In a throwaway repository, create two commits on a topic branch and check out the earlier one. Observe detached HEAD, create another commit, then return to the original branch and examine reflog. You should be able to locate the detached commit by its SHA even if no branch currently points at it. Do not mistake this laboratory behavior for an unlimited guarantee: garbage collection and reflog expiry can make old objects unavailable.

## Done criteria
Record the lost change's original branch, whether it was committed, the recovery SHA, and the exact files verified after restoration. Pushing recovered history to a shared remote is a separate action requiring review; avoid rewriting collaborators' history simply to repair your local state.

## A recovery drill that does not discard work
Use an empty temporary directory. Configure a synthetic local Git identity there, create `note.txt` with `one`, add it and commit. Record that commit as A. Change the file to `two`, commit and record B. Run `git switch --detach A` using the recorded hash, create `detached.txt`, and commit it as C. Now `git switch -` can return to the preceding branch; `git reflog --date=iso -8` should show the detached commit.

Inspect C with `git show --stat C` and create `git branch recovered C`, substituting the actual hash. `git show recovered:detached.txt` should retrieve the committed content without checking out or replacing your current files. The drill requires no reset, clean, force push or remote repository.

## Uncommitted data needs a different recovery route
Reflog records movements of references in that local repository. It is not an automatic backup of unstaged file bytes, untracked files or work in another clone. Editor history, a filesystem backup, a previous stash or a copied working tree may help those cases. Inspect `git stash list` without assuming a stash exists. Protect any recovered files before attempting cleanup, and distinguish a branch name from the commit object it currently references.

Reference: [git reflog](https://git-scm.com/docs/git-reflog).
