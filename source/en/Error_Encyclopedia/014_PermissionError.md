# Python PermissionError: identify the blocked operation first

PermissionError is an OS-level refusal to perform an operation. It can occur when opening a file for reading, creating a file in a protected directory, walking an inaccessible parent path, or starting an executable. Those causes require different repairs; granting universal write access is not a diagnosis.

## Reproduce read and write decisions in a temporary workspace

~~~python
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as folder:
    root = Path(folder)
    note = root / "note.txt"
    note.write_text("example", encoding="utf-8")
    assert note.read_text(encoding="utf-8") == "example"
    print("parent:", note.parent)
~~~

The successful baseline proves your current process can write within its own temporary directory. It does not prove the same process may write to a system configuration directory or another user's home. Use the failing path and action to determine exactly which permission was required. Do not intentionally modify system locations as part of a teaching exercise.

## The key distinction: read, write, execute and directory traversal

A file may be readable but not writable; a directory may allow listing but prevent creation; a script may be readable yet not directly executable. POSIX parent directories need search/execute permission to traverse. A mount configured noexec can prevent direct execution even when an executable bit appears set. On Android shared storage, the Termux app's permissions and mount rules matter, so Linux chmod advice may not apply.

## Inspect without broad permission changes

For Linux/Termux, id and ls -ld on the specific file and its parents can help identify process identity and modes. On Windows inspect the relevant ACLs and whether the process is blocked by policy or read-only location. Distinguish a PermissionError from a FileNotFoundError before touching either file contents or permissions.

## Safe remediation and verification

Prefer moving the application's writable output into a user-owned data directory or granting narrowly scoped access through the supported administration process. Never recommend chmod -R 777, blanket chown, or running every command with administrator rights. Retest one operation against the intended directory and record the before-and-after result. A permission change that only silences one error without respecting ownership is not a reliable fix.
