# Git non-fast-forward — preserve both people's commits

## Recognize the exact condition
A normal push to main is rejected when the remote contains a commit that is not an ancestor of your local branch tip. The refusal protects remote work that arrived after your last fetch. It does not mean that GitHub has lost code, that credentials are wrong or that a forced push is appropriate. In a single-main-branch project, update your remote-tracking information before deciding how to reconcile histories.

## Run a fully local two-clone reproduction
Save as reproduce.sh and run sh reproduce.sh with Git installed. This fixture creates a local bare repository and two disposable working copies called alice and bob, without any internet, real GitHub credentials or actual project repository. Alice pushes a change; Bob tries to push from an older base and receives the expected rejection. A fetch and rebase preserve both commits, and a normal push completes the test.

~~~sh
#!/usr/bin/env sh
set -eu
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
git init -q --bare "$work/remote.git"
git -C "$work/remote.git" symbolic-ref HEAD refs/heads/main
git init -q -b main "$work/seed"
git -C "$work/seed" config user.name 'Local Example'
git -C "$work/seed" config user.email 'example@invalid.test'
printf 'baseline\n' > "$work/seed/README.md"
git -C "$work/seed" add README.md
git -C "$work/seed" commit -qm 'seed'
git -C "$work/seed" remote add origin "$work/remote.git"
git -C "$work/seed" push -q -u origin main
git clone -q "$work/remote.git" "$work/alice"
git clone -q "$work/remote.git" "$work/bob"
for who in alice bob; do
  git -C "$work/$who" config user.name 'Local Example'
  git -C "$work/$who" config user.email 'example@invalid.test'
done
printf 'from Alice\n' > "$work/alice/alice.txt"
git -C "$work/alice" add alice.txt
git -C "$work/alice" commit -qm 'alice'
git -C "$work/alice" push -q origin main
printf 'from Bob\n' > "$work/bob/bob.txt"
git -C "$work/bob" add bob.txt
git -C "$work/bob" commit -qm 'bob'
if git -C "$work/bob" push -q origin main 2> "$work/rejection.log"; then
  echo 'FAIL: non-fast-forward unexpectedly accepted' >&2
  exit 1
fi
git -C "$work/bob" fetch -q origin main
git -C "$work/bob" rebase -q origin/main
git -C "$work/bob" push -q origin main
git -C "$work/remote.git" cat-file -e main:alice.txt
git -C "$work/remote.git" cat-file -e main:bob.txt
printf 'PASS: rejection observed; remote history preserved without force push\n'
~~~

## Repair your actual project cautiously
First inspect git status and git fetch origin, then compare git log --oneline HEAD..origin/main with git log --oneline origin/main..HEAD. If the working tree has unsaved changes, commit or safely stash them before reconciliation. For independent local commits, git rebase origin/main replays them over the remote tip; a merge may be preferable when your team explicitly preserves merge commits. Resolve conflicts deliberately, run affected tests, then push without --force. If the remote changed again, fetch and reconcile again. Do not treat --force-with-lease as an automatic fix; it can still discard work if used without understanding the protected branch.

## Failure interpretation
1. In the fixture, explain which commit is present only in Alice's history immediately after she pushes.
2. Modify the same README line in both clones instead of separate files. Reproduce a rebase conflict and show how to resolve it in a throwaway repository.
3. Run git log --graph --oneline --all after the successful push and explain the new parent chain.
4. If you cannot safely rebase because of published local commits, discuss a non-destructive merge. Never reset a production branch just to suppress the rejection.

**Evidence:** expected rejection, successful reconciliation, and verification that both alice.txt and bob.txt remain in remote/main.

**Reference:** https://docs.github.com/en/get-started/using-git/dealing-with-non-fast-forward-errors
