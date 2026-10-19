# Safely updating a Git branch

## What is happening
Start with git status and inspect whether any modifications are uncommitted. A pull or rebase can fail because history diverged, not because files are missing.

## Practical investigation
Prefer a normal merge when collaborating unless the team agrees to rewrite local commits. Never force-push shared history merely to bypass a conflict.

## Common traps
Verify the resulting HEAD, history and tests before release. If a conflict is unresolved, stop rather than deleting one side blindly.

## Adaptable demonstration
```text
git status --short && git log --oneline -5
```

## Inspect divergence before choosing an integration policy
~~~sh
git fetch origin
git log --oneline --left-right HEAD...origin/main
git diff --stat HEAD..origin/main
~~~
Fetch updates remote-tracking information without merging it into the working tree. The three-dot history comparison shows commits reachable from only one side; the two-dot diff compares the named endpoint trees. Use the intended branch name rather than assuming every repository calls it main.

If policy requires a linear fast-forward, `git pull --ff-only` refuses divergent local history. A refusal is a useful guard, not permission to reset away commits. A merge preserves branch ancestry; a rebase replays local changes as new commits and changes their identities. During a conflict, inspect the current operation and use its corresponding abort command if you need to return to the pre-operation state. Test with a throwaway clone before changing shared work.

Reference: [git pull](https://git-scm.com/docs/git-pull).
