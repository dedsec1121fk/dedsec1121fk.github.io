# Glossary: stacks, static typing and streams

## Stack

### Actual meaning
Last-in-first-out structure: push adds an item and pop removes the most recently added one. Program call stacks also hold execution frames, but they are not the same as an explicit data-structure stack.

### Concrete starting point
~~~text
stack=[]
stack.append('open'); stack.append('close')
assert stack.pop()=='close'
assert stack.pop()=='open'
~~~

### Apply the rule
Use a stack to validate matching parentheses, then test an unexpected closing bracket and a remaining opening bracket.

### Diagnose a counterexample
For Stack, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## Static typing

### Actual meaning
Checking types before program execution or during compilation, as in TypeScript and Rust. Static type guarantees depend on language soundness and do not automatically validate external JSON at runtime.

### Concrete starting point
~~~text
type Record = {score: number};
const r: Record = {score: 3};
// const bad: Record = {score: '3'}; // compile error
~~~

### Apply the rule
Compile with strict mode, introduce the bad assignment, then demonstrate a runtime parser that rejects unexpected string data.

### Diagnose a counterexample
For Static typing, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## Stream

### Actual meaning
Sequence processed incrementally rather than necessarily stored all at once. File streams, network streams and async iterators differ in buffering, backpressure and error reporting.

### Concrete starting point
~~~text
from io import StringIO
with StringIO('first\nsecond\n') as src:
    assert [line.strip() for line in src]==['first','second']
~~~

### Apply the rule
Process a large synthetic file line by line without readlines(), track peak memory and decide where line length limits belong.

### Diagnose a counterexample
For Stream, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## String

### Actual meaning
Ordered text representation. Python strings are sequences of Unicode code points, not raw UTF-8 bytes, and combining characters may affect visible character count.

### Concrete starting point
~~~text
text='Γεια'
assert len(text)==4
assert len(text.encode('utf-8'))>len(text)
~~~

### Apply the rule
Compare 'é' and 'e\u0301' before and after NFC normalization; record code points and encoded byte lengths.

### Diagnose a counterexample
For String, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## Timeout

### Definitions
A timeout is a limit on waiting or computation. A connection timeout, idle-read timeout and total operation deadline are not the same. Expiration does not necessarily mean the remote server rolled back an operation; a payment or upload may have completed just before the client stopped waiting.

### Local process lab with controlled cleanup
~~~python
import subprocess
import sys

try:
    subprocess.run(
        [sys.executable, "-c", "import time; time.sleep(2)"],
        timeout=0.2,
        check=True,
    )
except subprocess.TimeoutExpired:
    print("timed out")
~~~
Expected output is timed out when the child sleeps longer than the configured limit. subprocess.run kills and waits for the direct child on expiration. This does **not** guarantee killing every grandchild of an arbitrary process tree or limiting initial process-creation overhead to exactly 0.2 seconds.

### Test outcomes, not just elapsed time
1. Replace sleep(2) with a quick print command; verify the successful return path and exit status.
2. Trigger an immediate nonzero exit with check=True; catch CalledProcessError separately from TimeoutExpired.
3. For an HTTP update operation, record a client-generated idempotency key. On timeout, query server state before blindly retrying a write.
4. Test successive retry backoff and a total deadline; repeated short per-attempt timeouts can exceed the user's overall time budget.
5. Close files/locks and provide cancellation when a user leaves a page. Do not assume a canceled UI request cancels server work.

### Acceptance criteria
Show actual timings and error types on your platform, not a guessed wall-clock guarantee. Record child-process cleanup behavior and whether remote effects were observed or merely uncertain.
