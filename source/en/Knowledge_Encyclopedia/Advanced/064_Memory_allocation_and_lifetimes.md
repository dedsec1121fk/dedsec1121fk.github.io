# Memory and resource lifetimes — cleanup on exceptional paths

## Lifecycle contract
An object being reachable, an object owning a resource, and a resource remaining open are different properties. Python can reclaim ordinary memory through reference counting or garbage collection, but a file handle or socket has an external lifetime that should not depend on a future collection cycle. In C, returning a pointer to an automatic local object produces a dangling reference; in Rust the borrow checker instead enforces ownership constraints before execution. Do not assume that a higher-level language removes the need to close resources.

## Executable cleanup fixture (Python 3)
Save as lifetime_lab.py and run python3 lifetime_lab.py. Contextlib.ExitStack registers the resources and releases them in reverse order even when parsing raises a simulated exception.

~~~python
from contextlib import ExitStack
from io import StringIO

closed = []
class Tracked(StringIO):
    def __init__(self, name):
        super().__init__(name)
        self.name = name
    def close(self):
        if not self.closed:
            closed.append(self.name)
        super().close()

first, second = Tracked("first"), Tracked("second")
try:
    with ExitStack() as stack:
        a = stack.enter_context(first)
        b = stack.enter_context(second)
        assert a.read() == "first" and b.read() == "second"
        raise RuntimeError("simulated parse failure")
except RuntimeError:
    pass
assert first.closed and second.closed
assert closed == ["second", "first"]
print("PASS: reverse-order cleanup on failure")
~~~

## What the assertions establish
Both text handles are closed after the exception. Because contexts unwind in reverse registration order, second closes before first. An ExitStack offers a useful mechanism when a variable number of resources are opened gradually; if the third acquisition fails, the first two must still be closed. The test checks logical resource ownership; it does not measure garbage-collector timings or prove leak freedom for arbitrary native allocations.

## Bounded investigation and diagnostics
1. Add a third Tracked resource, trigger a failure before entering it, and check exactly which handles close.
2. Temporarily remove ExitStack. Capture the difference between an explicit cleanup guarantee and eventual garbage collection, then restore context management.
3. Build a cache holding a file path rather than an open handle. Explain the changed resource lifetime and stale-data tradeoff.
4. Sketch the corresponding ownership rules for C malloc/free and Rust moves/borrows without executing unsafe C on personal files. If you have a compiler, exercise sanitizers on a disposable demonstration only.

**Evidence:** PASS, cleanup order, exception trace and an ownership diagram. Distinguish memory reclamation from operating-system handle cleanup.
