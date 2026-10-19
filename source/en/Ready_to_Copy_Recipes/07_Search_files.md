# Recipe: deterministic read-only Python file discovery

## Intended use and acceptance criteria
For a local programming workspace, enumerate regular .py files below one explicitly chosen directory without modifying them. Return relative POSIX-style paths in sorted order so repeated scans are comparable. Reject missing roots and skip symbolic links found as matching files to reduce accidental traversal into unexpected locations.

## Complete runnable example
Save this as `07_Search_files.py` and execute with Python 3. The fixture is disposable and has no network dependency.

~~~python
import tempfile
from pathlib import Path
def list_python(root):
    base = Path(root)
    if not base.is_dir():
        raise ValueError("root must be a directory")
    found = []
    for path in base.rglob("*.py"):
        if path.is_file() and not path.is_symlink():
            found.append(path.relative_to(base).as_posix())
    return sorted(found)
with tempfile.TemporaryDirectory() as folder:
    root = Path(folder)
    (root/"inner").mkdir()
    (root/"main.py").write_text("pass\n")
    (root/"inner"/"α.py").write_text("pass\n")
    (root/"ignore.txt").write_text("other\n")
    assert list_python(root) == ["inner/α.py", "main.py"]
    assert list_python(root/"inner") == ["α.py"]
    try: list_python(root/"missing")
    except ValueError: pass
    else: raise AssertionError("missing root accepted")
print("PASS read-only recursive Python search")
~~~

## Guarantees and limitations
Path.rglob is recursive and convenient, but filesystem traversal has race conditions: files may vanish between enumeration and use. `is_file` and `is_symlink` are checks on current state, not a security guarantee against malicious concurrent changes. Case-sensitive matching to *.py does not include *.PY; choose that policy deliberately. This helper is read-only and does not inspect Python source content or automatically execute discovered files.

## Adaptation lab
Add a file with spaces, a Greek directory name, and a symbolic link to a Python file in a disposable fixture. Confirm what is included and what is skipped. Compare sorted relative paths on two runs. Add an explicit maximum file count and a user-visible message if the directory is too large. For hostile directories, a stronger descriptor-based traversal strategy is necessary.

## Troubleshooting and release check
If a file is missing from results, inspect its extension, symlink status, parent path and permissions. If an inaccessible directory raises an error, report which subtree failed rather than presenting a partial list as complete. On Android, storage access permissions can differ from Termux home-directory access.
