# Inspect archives as structured data before extraction

## Enumerate without trusting file names
An archive entry's stored name may contain parent traversal `../`, absolute paths, repeated names or platform-specific separators. The declared uncompressed size can be enormous relative to its compressed size. Before accepting an unknown ZIP, set limits for file count, total uncompressed bytes and per-entry size; normalize names without permitting escape from the destination.

~~~python
from pathlib import PurePosixPath
names = ["docs/readme.txt", "../outside.txt", "/absolute/config"]
for name in names:
    parts = PurePosixPath(name.replace("\\", "/")).parts
    safe = not name.startswith(("/", "\\")) and ".." not in parts
    print(name, safe)
~~~

## Detect collisions before writing
Files named `A.txt` and `a.txt` may collide on case-insensitive systems. Repeated paths in one archive might be interpreted differently by different extractors. Symlink targets can point outside the extraction root even when entry names look harmless. A content scanner must consider the *resolved destination* and refuse unsupported link types, not merely strip `../` from suspicious strings.

## Use a deliberately hostile fixture
Create a tiny ZIP whose members include one safe path, one traversal path and two case-colliding names, without extracting it to a real project. Build a validator that returns a structured list of rejected entries. The expected behavior is fail-closed on the entire archive or quarantined extraction under a deliberately safe policy, not silently writing some unsafe members.

## Success boundaries
Document each configured limit and verify that zero bytes are written outside a disposable extraction root. A valid CRC does not prove a safe filename, acceptable decompressed size or trustworthy publisher. Keep the test archive alongside a hash and the expected rejection report.
