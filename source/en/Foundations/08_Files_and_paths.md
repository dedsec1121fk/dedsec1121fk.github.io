# Files and paths

Resolve files relative to known locations, not the caller's accidental working directory. Avoid overwriting user files. For data, write to a temp file first and replace only after success.

## Worked example

```text
from pathlib import Path
p = Path("notes.txt")
if not p.exists():
    p.write_text("first note\n", encoding="utf-8")
print(p.read_text(encoding="utf-8"))
```

## Practice

Change this to append a new line without erasing existing notes.

## Corrected result / hint

Open the file using mode="a" and encoding="utf-8".

## A file path is contextual
`Path("data.json")` is relative to the current working directory, not automatically to the script that mentions it. For read-only bundled data use `Path(__file__).resolve().parent / "data.json"`; for writable application data use a deliberately selected user directory. Do not place credentials in source directories.
```python
from pathlib import Path
root=Path(__file__).resolve().parent
candidate=(root/"fixtures"/"sample.txt").resolve()
if not candidate.is_relative_to(root):
    raise ValueError("outside workspace")
```
Path containment checks can be invalidated by symlink races during subsequent open operations; they are a useful first check, not a complete secure file API. Shared Android storage may be non-executable; keep scripts in Termux private `$HOME` and treat `~/storage` as interchange.

**Exercise:** run the same script from two different working directories and prove that its bundled input resolves identically.

## File-system boundary: isolated fixture

~~~python
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as directory:
    target = Path(directory) / "δοκιμή.txt"
    target.write_text("line\n", encoding="utf-8")
    assert target.read_text(encoding="utf-8") == "line\n"
    assert target.is_file()
~~~

Keep each test inside a disposable directory. Compare opening a nonexistent path with calling `read_text` on a directory: the failures are not interchangeable. For untrusted relative paths, resolve a candidate beneath an allowed root and verify containment with `Path.is_relative_to`, but note that symlink changes between check and open create a race. As a separate persistence experiment write a temporary file in the same directory and `replace` the destination. Explain why atomic rename does not alone guarantee durability after a sudden power failure. Reference: https://docs.python.org/3/library/pathlib.html
