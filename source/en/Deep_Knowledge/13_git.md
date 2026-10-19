# Git revisions — verify ancestry before a fast-forward update

## Scenario and acceptance criteria
Create two commits inside a disposable repository and prove that the earlier one is an ancestor of the later one. The reverse condition must not pass. Clean status after the second commit is a separate invariant. No remote is configured, and no command touches the user's actual repository or branches.

## Executable lab
Save as `13_git.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
import os, pathlib, subprocess, tempfile
def git(cwd, *args):
    return subprocess.run(["git","-C",str(cwd),*args], check=True,
                          capture_output=True, text=True).stdout.strip()
with tempfile.TemporaryDirectory() as folder:
    path = pathlib.Path(folder)
    git(path, "init", "-q")
    git(path, "config", "user.name", "Fixture")
    git(path, "config", "user.email", "fixture@example.invalid")
    (path/"lesson.md").write_text("one\n", encoding="utf-8")
    git(path, "add", "--", "lesson.md")
    git(path, "commit", "-qm", "first")
    base = git(path, "rev-parse", "HEAD")
    (path/"lesson.md").write_text("two\n", encoding="utf-8")
    git(path, "add", "--", "lesson.md")
    git(path, "commit", "-qm", "second")
    latest = git(path, "rev-parse", "HEAD")
    assert base != latest
    assert subprocess.run(["git","-C",str(path),"merge-base",
                           "--is-ancestor",base,latest]).returncode == 0
    assert subprocess.run(["git","-C",str(path),"merge-base",
                           "--is-ancestor",latest,base]).returncode == 1
    assert git(path, "status", "--porcelain") == ""
print("PASS disposable Git ancestry checks")
~~~

## Technical interpretation
A safe shared-branch update depends on the *current* remote head, not the head observed several minutes ago. Fetch, inspect the new commits, then require that the expected base is still the branch tip when updating. `git merge-base --is-ancestor old new` checks history relation, but it is not by itself a compare-and-swap against a concurrently advancing remote ref. A real push must avoid `--force` and handle a non-fast-forward rejection by fetching and reconciling both sides.

## Bounded experiments
Create a third commit and compare each ordered ancestry pair. Change a tracked file without committing and compare `git status --porcelain` with the clean result. Test an unrelated branch from an orphan history in a fresh fixture and record the ancestry failure. Use `git diff --check` before a real commit to detect trailing whitespace and conflict markers.

## Diagnostics
If a push is rejected, do not force it or silently discard other authors' changes. Fetch the new head and inspect affected paths, especially generated website overlays and canonical Markdown. Avoid commits containing secrets and verify .gitignore does not hide required source files. This lab runs only where Git is installed.
