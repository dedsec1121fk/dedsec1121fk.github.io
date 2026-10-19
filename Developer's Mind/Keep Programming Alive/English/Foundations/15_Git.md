# Git history, safe changes and recovery

## Git and safe change history

Create a branch or make a local backup before risky changes. Review git diff and git status; do not overwrite the canonical origin. A working tree with uncommitted user changes is not a safe target for reset --hard.

### Worked example

```text
git status --short
git remote -v
git diff --check
git log -5 --oneline
```

### Practice

Explain the difference between git fetch and git pull.

### Corrected result / hint

fetch obtains remote objects; pull also attempts integration.

### Reversible edits in a disposable repository

~~~sh
mkdir git-scratch && cd git-scratch
git init -b main
printf 'first\n' > note.txt
git add note.txt
git diff --cached --check
git commit -m "Record baseline"
printf 'second\n' >> note.txt
git diff -- note.txt
git status --short
~~~

Set a local author identity if Git requests one. `git diff` shows unstaged edits and `git diff --cached` shows staged edits: the two states must not be conflated. Commit the second change, inspect `git log --oneline`, and use `git revert <second-commit-sha>` to create a new reversal commit. Explain why `reset --hard` can destroy uncommitted tracked work and is not an automatic repair for shared `main`. Verification must be tied to the exact commit SHA: a successful push never proves browser or lesson quality. Documentation: https://git-scm.com/docs

## Git history, branches, merge conflicts and recovery

A Git commit records a snapshot and ancestry. Branches are movable references to commits. A merge combines histories; rebase rewrites local ancestry. Avoid force-pushing shared branches, especially when automations or teammates depend on commit identity.

### Safe review commands
```bash
git status --short
git remote -v
git log --oneline -5
git diff --check
git diff --stat
```

A `non-fast-forward` rejection means your local branch does not simply advance the remote reference. Fetch, inspect and reconcile upstream history instead of immediately using `--force`. A backup copy and a clean worktree reduce accidental loss.

### Practice
1. Create a topic branch, intentionally conflict and resolve it.
2. Compare `git revert` with `git reset --hard` and explain which preserves shared history.
3. Recover a recently lost local commit using reflog.

## git: not a git repository

### Meaning and differential diagnosis
Git cannot locate repository metadata from the current directory upward. This may be an ordinary folder, a folder copied without its .git metadata, a deleted working tree, or an unexpectedly changed current directory in a script. Do not run git init reflexively: that creates a new, unrelated history.

### Reproduction / nondestructive inspection
~~~sh
pwd
git rev-parse --show-toplevel
git rev-parse --git-dir
git status --short
# If outside a repository, commands above fail by design.
# Inspect the intended folder before changing it:
ls -la /path/to/project
git -C /path/to/project rev-parse --show-toplevel
~~~

### Interpret evidence and fix the cause
Capture pwd from the same shell or process that fails. Distinguish a worktree (.git may be a file) from a plain directory; never assume .git must be a directory. If the repository is missing, recover from the known remote or backup after preserving local files. If a script changed directory, anchor paths to its own location and fail early.

### Practical lab
Run the rev-parse commands in a temporary plain directory and in an existing clone; record exit status, stdout and stderr. Check that a repair does not create a second .git inside a real repository.
