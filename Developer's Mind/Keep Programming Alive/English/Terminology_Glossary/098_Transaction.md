# Glossary: transactions, inferred types and unit tests

## Transaction

### Actual meaning
A unit of database work committed together or rolled back together. Atomicity does not mean every race is solved; isolation level and concurrent writers remain relevant.

### Concrete starting point
~~~text
BEGIN;
INSERT INTO tasks(title) VALUES ('first');
-- perform other work
ROLLBACK;
~~~

### Apply the rule
In disposable SQLite, prove a row inserted inside a rolled-back transaction does not persist, then compare with a committed insert.

### Diagnose a counterexample
For Transaction, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## Type inference

### Actual meaning
Compiler derives a type from context without explicit annotation. This is still static typing where the language enforces it; inference does not mean treating all values as any.

### Concrete starting point
~~~text
const scores: number[] = [2,4];
const doubled = scores.map(n => n*2);
// n inferred number
~~~

### Apply the rule
Make the array string[], attempt numeric multiplication and inspect the TypeScript diagnostic. Compare inference with an explicit wrong annotation.

### Diagnose a counterexample
For Type inference, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## Unit test

### Actual meaning
Small repeatable check of a focused behavior with controlled inputs. Unit tests differ from integration tests involving real databases, browsers or network services.

### Concrete starting point
~~~text
def clamp(x, lo, hi): return min(max(x,lo),hi)
assert clamp(5,0,10)==5
assert clamp(-1,0,10)==0
~~~

### Apply the rule
Add exact boundary checks 0 and 10, then decide whether lo>hi should raise rather than return an accidental value.

### Diagnose a counterexample
For Unit test, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## WebSocket

### Actual meaning
Protocol for ongoing bidirectional communication over a connection, commonly initiated by an HTTP Upgrade handshake. Unlike one-shot HTTP requests, clients need connection lifecycle and reconnect policy.

### Concrete starting point
~~~text
const ws = new WebSocket('wss://example.test/echo');
ws.addEventListener('message', e => console.log(e.data));
// Requires an authorized matching server.
~~~

### Apply the rule
Build a local test server and verify open/message/close states. Explain why reconnecting should not repeat side-effecting messages blindly.

## Yield

### Actual meaning
A construct suspending a generator and producing a value while preserving its execution state. It differs from return, which finishes the function invocation.

### Concrete starting point
~~~text
def counter():
    yield 1
    yield 2
assert list(counter())==[1,2]
~~~

### Apply the rule
Call next repeatedly, then confirm StopIteration after the last value. Compare generator with a function returning [1,2] eagerly.

### Diagnose a counterexample
For Yield, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.
