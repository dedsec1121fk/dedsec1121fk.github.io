# Async cancellation, safe paths and subprocess execution

## Async IO and cancellation

**Track:** Systems

### Core explanation

Asynchronous IO avoids blocking while waiting on external operations. It does not make CPU-heavy tasks automatically faster. Support timeouts, cancellation and resource cleanup.

### Hands-on application

Design an asynchronous request timeout with cleanup in finally.

### How the system actually behaves
Asynchronous I/O interleaves tasks while waiting for operations. `async def` returns a coroutine object that must be awaited or scheduled. Cancellation is part of the task's lifecycle: cleanup belongs in finally, and swallowing CancelledError can prevent graceful shutdown.

### Runnable controlled experiment
```python
import asyncio
async def worker():
    try: await asyncio.sleep(10)
    finally: print('cleanup')
async def main():
    task=asyncio.create_task(worker())
    await asyncio.sleep(0)
    task.cancel()
    try: await task
    except asyncio.CancelledError: pass
asyncio.run(main())
```

### Failure analysis and extension
Record the order of creation, first suspension, cancellation and cleanup. Compare cancelling a Task with merely abandoning a coroutine; add a shared resource and verify finally closes it.

**Reference:** https://docs.python.org/3/library/asyncio-task.html

## Filesystem paths and symlinks

**Track:** Systems

### Core explanation

Canonicalization, relative paths and symbolic links affect access control. For archive extraction and uploads, reject paths escaping the intended root; a string prefix alone is not a secure containment test.

### Hands-on application

Check whether a resolved child path remains inside a temporary workspace.

### How the system actually behaves
A path is a name resolved by the filesystem, not a permanent identity of the target object. Symlinks, relative components and mount points can alter the resolved destination. `Path.resolve` is useful for diagnostics but does not alone prevent a time-of-check/time-of-use race if another process can change the tree.

### Runnable controlled experiment
```python
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as p:
    root=Path(p).resolve()
    (root/'ok.txt').write_text('ok')
    assert (root/'ok.txt').resolve().is_relative_to(root)
```

### Failure analysis and extension
Compare an inside file and a sibling named root-extra to show why string startswith is unsafe. For hostile filesystem writers, research directory-relative, no-follow file opens and validate the opened descriptor.

**Reference:** https://docs.python.org/3/library/pathlib.html

## Subprocess safety

**Track:** Systems

### Core explanation

Pass argument arrays to subprocess APIs and avoid shell interpretation for untrusted values. Use timeouts, explicit working directories and checked return codes.

### Hands-on application

Invoke a benign version-check command with an argument list, not string interpolation.

### How the system actually behaves
Subprocess arguments are data when passed as an explicit array with shell=False; joining user strings into a shell command changes the parsing and may execute unintended operators. Limit runtime, check exit codes and capture only bounded output when external commands handle untrusted inputs.

### Runnable controlled experiment
```python
import subprocess,sys
text='hello; echo unexpected'
p=subprocess.run([sys.executable,'-c','import sys; print(sys.argv[1])',text],capture_output=True,text=True,check=True,timeout=3)
assert p.stdout.strip()==text
```

### Failure analysis and extension
Test a command returning exit code 7 and catch CalledProcessError. Test a child exceeding its timeout; compare FileNotFoundError with a nonzero exit and reject arbitrary executable paths by policy.

**Reference:** https://docs.python.org/3/library/subprocess.html
