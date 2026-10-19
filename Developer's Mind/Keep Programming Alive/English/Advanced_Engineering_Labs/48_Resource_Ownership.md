# Resource ownership and exception-safe cleanup

## Mechanism and contract

A function that opens a resource needs a clear owner for closing it. Ownership becomes confusing when a helper accepts both filenames and open streams, or when a generator yields values while keeping a file open. Define whether callers transfer ownership or merely borrow the handle. Closing a borrowed handle can break unrelated code; failing to close an owned one can exhaust descriptors.

Context managers make the lifetime visible and run cleanup when the body raises. Multiple resources should be acquired so a failure during the second acquisition still releases the first. ExitStack is useful when the count is dynamic. Cleanup can itself fail, so retain enough exception context to diagnose the original operation and the cleanup failure instead of reporting unconditional success.

## Worked local example

```python
from contextlib import ExitStack
import io
opened = []
try:
    with ExitStack() as stack:
        for text in ("one", "two"):
            stream = stack.enter_context(io.StringIO(text))
            opened.append(stream)
        raise ValueError("fixture failure")
except ValueError:
    pass
assert len(opened) == 2 and all(s.closed for s in opened)
print("owned streams closed")
```

## Failure checks and limits

Add a failure during acquisition, not only inside the fully initialized body. Verify no resource escapes with ambiguous ownership. A destructor is not a timely cleanup protocol, especially with reference cycles or process termination. For asynchronous resources use the corresponding asynchronous context protocol, and ensure cancellation reaches cleanup rather than being swallowed by a broad exception handler.

## Primary reference

[Official documentation](https://docs.python.org/3/library/contextlib.html#contextlib.ExitStack)
