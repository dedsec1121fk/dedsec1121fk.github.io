# Recipe: inspect Git changes without touching a real repository

## Intended use and acceptance criteria
When reviewing a project update, collect a clean baseline, edit one tracked fixture in a disposable repository and use read-only Git commands to inspect the changed path and patch. This distinguishes working-tree modifications from committed history. All write operations in the example set up only the temporary fixture; the actual review commands do not stage, commit or push.

## Complete runnable example
Save this as `10_Safe_Git_review.py` and execute with Python 3. The fixture is disposable and has no network dependency.

~~~python
import pathlib, subprocess, tempfile
def git(root,*args):
    return subprocess.run(["git","-C",str(root),*args],check=True,
                          capture_output=True,text=True).stdout
with tempfile.TemporaryDirectory() as directory:
    root = pathlib.Path(directory)
    git(root,"init","-q")
    git(root,"config","user.name","Review Fixture")
    git(root,"config","user.email","review@example.invalid")
    (root/"note.txt").write_text("baseline\n")
    git(root,"add","--","note.txt")
    git(root,"commit","-qm","baseline")
    assert git(root,"status","--porcelain=v1").strip() == ""
    (root/"note.txt").write_text("edited\n")
    lines = git(root,"status","--porcelain=v1").splitlines()
    assert any(line.startswith(" M ") for line in lines)
    assert "edited" in git(root,"diff","--","note.txt")
    assert git(root,"diff","--check") == ""
print("PASS read-only Git review after disposable setup")
~~~

## Guarantees and limitations
`git status --porcelain=v1` offers a stable parseable short status. A leading space followed by M indicates a working-tree modification that has not been staged. `git diff -- note.txt` shows only the chosen path; `git diff --check` diagnoses whitespace problems in unstaged changes. These checks do not prove that remote main has not advanced: remote synchronization requires fetch and comparison with the current remote ref.

## Adaptation lab
Stage the fixture file and compare ordinary git diff with git diff --cached. Add untracked data and inspect its porcelain prefix. Revert a fixture deliberately and verify a clean status. Use an unrelated temporary branch to demonstrate that review should consider changes from collaborators before an attempted fast-forward.

## Troubleshooting and release check
If git diff is empty while status still indicates a staged modification, inspect `git diff --cached`. If a path is ignored, use `git check-ignore -v` to understand its pattern. Never run reset --hard, clean -fd or force push as a substitute for reading an unfamiliar repository's status.
