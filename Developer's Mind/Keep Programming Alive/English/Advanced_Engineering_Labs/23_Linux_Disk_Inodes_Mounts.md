# Diagnose storage errors by errno and filesystem

## Space, quota and read-only access are different failures
A failed file creation is not enough to conclude that the drive is full. ENOSPC indicates unavailable filesystem space or metadata capacity; EDQUOT concerns an enforced quota; EROFS means the operation targets a read-only filesystem. EACCES instead concerns access permission. A read-only mount can have plenty of free blocks. Keep the exact exception before choosing a repair.

## Inspect the destination, not just the root filesystem
~~~sh
df -h .
df -i .
findmnt -T . -o TARGET,FSTYPE,OPTIONS
du -h -d 1 .
~~~
Use the directory actually receiving the output in place of `.`. The temporary directory used during packaging can be on a different mount from the final ZIP. `df -i` is meaningful only for filesystems that expose useful inode accounting. `findmnt` is a Linux utility; a missing command on Android does not prove the storage is healthy or unhealthy.

## A bounded write probe with an identifiable result
After inspecting the path, run this against a directory you control. It creates and removes one temporary file; it does not delete caches or existing documents.
~~~python
from pathlib import Path
from tempfile import NamedTemporaryFile
import errno

target = Path('.')
try:
    with NamedTemporaryFile(dir=target, prefix='storage-probe-') as probe:
        probe.write(b'ok\n')
        probe.flush()
        print('write probe succeeded')
except OSError as exc:
    print(errno.errorcode.get(exc.errno, 'UNKNOWN'), exc.filename)
~~~
A successful small write only demonstrates that this operation worked at this time. It cannot prove that a large build will fit or that buffered data has survived a power loss. Reproduce the original operation after a narrowly chosen correction.

## Why du and df can disagree
`du` measures the files it can traverse; `df` reports filesystem accounting. Deleted files still held open by a process can consume space until the last descriptor closes. Snapshots, reserved blocks and container layers create further differences. Permission-denied messages during `du` make its total incomplete. Inspect the owning process before restarting it; deleting additional unrelated files does not address an open deleted file.

## Recovery decision
For block exhaustion, identify rebuildable output and estimate required headroom before removing it. For inode exhaustion, investigate unusually many small generated files. For EROFS following storage errors, preserve data and inspect kernel/storage diagnostics with the administrator; do not remount read-write as a blind first step. For quota exhaustion, free space elsewhere on the same disk may not change your allocation.

Reference: [Linux file-opening errors](https://man7.org/linux/man-pages/man2/open.2.html).
## Unlinked open files explain df/du disagreements

Removing a directory entry does not necessarily release the bytes immediately. An open file descriptor can keep an unlinked file alive until the last relevant reference closes. A filesystem-wide usage report may therefore count space that a directory walk cannot find by filename.

Diagnose which process owns the open handle before restarting anything. Do not truncate a descriptor belonging to an unknown service just to make a number smaller. The Linux fixture uses only a temporary file and proves that its contents remain readable through the already-open handle after unlinking.

```python
import os, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as folder:
    path=Path(folder)/"open.txt"
    path.write_bytes(b"still referenced")
    with path.open("rb") as stream:
        path.unlink()
        assert not path.exists()
        assert stream.read() == b"still referenced"
print("open handle retains data")
```

Run this on Linux or the private filesystem of Termux; file deletion rules differ on Windows. The tiny fixture does not measure reclaimed blocks. For an operational incident, compare mount scope, permissions and open-file evidence before concluding that filesystem accounting is broken.

[Technical reference](https://pubs.opengroup.org/onlinepubs/9799919799/functions/unlink.html)
