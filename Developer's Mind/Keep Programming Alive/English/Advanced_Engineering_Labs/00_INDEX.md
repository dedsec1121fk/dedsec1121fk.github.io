# Runtime lifetimes and data-structure selection

## Advanced engineering laboratories


## Runtime, call stack, heap and lifetimes

A program is not only source text. After parsing and compilation/interpreting, execution requires memory, I/O, a scheduler and a runtime. A function call ordinarily creates a *stack frame* containing return information, arguments and local bindings. Dynamically allocated objects often live in a heap, managed by allocation/free, reference counting or garbage collection depending on the language and runtime.

### Worked example (Python)
```python
def factorial(n: int) -> int:
    if n < 0: raise ValueError('n must be nonnegative')
    result = 1
    for value in range(2, n + 1):
        result *= value
    return result

assert factorial(5) == 120
```
This iterative solution uses O(1) auxiliary memory, whereas a recursive implementation would use O(n) call frames before tail-call optimization (which CPython does not provide as a general guarantee).

### Debugging and tradeoffs
A `MemoryError` can occur even without a recursion error. A stack overflow and heap exhaustion are different conditions. In C/C++, ownership and lifetime errors may create dangling pointers or double frees; in managed languages, holding references forever can leak *reachable* memory.

### Practice
1. Write recursive and iterative Fibonacci for n = 30; explain call-count difference.
2. Profile a growing list and identify when its lifetime ends.
3. Explain why returning a pointer to an automatic local variable is unsafe in C.

## Choosing data structures by operation costs

### Define the workload before choosing a type
For a queue with first-in-first-out behavior, a Python list can append efficiently but removing from index zero shifts the remaining elements. collections.deque supports efficient popleft, so choose it when repeatedly consuming from the front.

~~~python
from collections import deque

jobs = deque(["compile", "test"])
jobs.append("deploy")
assert [jobs.popleft(), jobs.popleft(), jobs.popleft()] == [
    "compile", "test", "deploy"
]
~~~

A deque is not automatically the best choice for random indexed access: a list generally supports efficient O(1) indexing, while accessing interior deque elements can be O(n). State which operations dominate before optimizing.

### Membership checks and memory
If an application repeatedly asks whether 1 million IDs belong to a collection, consider a set. Python set membership is expected average O(1), versus linear list membership O(n). But sets have memory overhead, do not preserve duplicates, and are not an API for deterministic sorted output. If order matters, sort results when presenting them, or preserve a separate ordered structure. A dict maps keys to values and maintains insertion order in modern Python, but a dict is not a priority queue.

### When a heap wins
For a scheduler ordered by next deadline, use heapq and store pairs (deadline, tie_breaker, task). Including a monotonically increasing tie_breaker avoids trying to compare incomparable task objects when deadlines match. A heap maintains a partial order: heap[0] is smallest, but iterating the heap does not produce sorted order.

### Counterexample to a shallow complexity claim
O(1) expected lookup does not prove a set is fastest for every small input. Hashing, allocations, cache effects and key comparison costs matter. Benchmark tiny and large datasets separately and ensure both solutions produce the same semantics before comparing speed.

### Acceptance criteria
Provide a decision table for queue, membership index, priority queue and ordered display. Measure operations at several input sizes with timeit outside the first-run warmup. Test empty pop, duplicate keys and identical deadlines, and document Python version and observed results. The examples are reasoned expectations, not claimed runtime execution in this audit.
## Engineering field notes

- [SQLite live backup and restoration drills](#read:fieldnotes-en-34)
- [Crash-safe checkpoints and file replacement](#read:fieldnotes-en-35)
- [Monotonic deadlines across a retry budget](#read:fieldnotes-en-36)
- [Bounded work queues and overload decisions](#read:fieldnotes-en-37)
- [Keyset pagination with stable ordering](#read:fieldnotes-en-38)
- [Optimistic concurrency and lost-update prevention](#read:fieldnotes-en-39)
- [CSV import contracts and spreadsheet formula boundaries](#read:fieldnotes-en-40)
- [Incremental UTF-8 decoding across chunk boundaries](#read:fieldnotes-en-41)
- [Decimal rounding policies and reconciliation](#read:fieldnotes-en-42)
- [Daylight-saving ambiguity and scheduling contracts](#read:fieldnotes-en-43)
- [Structured log redaction before serialization](#read:fieldnotes-en-44)
- [Content Security Policy rollout with report-only evidence](#read:fieldnotes-en-45)
- [Subresource integrity and release pinning](#read:fieldnotes-en-46)
- [Transactional outbox and duplicate delivery](#read:fieldnotes-en-47)
- [Resource ownership and exception-safe cleanup](#read:fieldnotes-en-48)
- [Configuration precedence and provenance](#read:fieldnotes-en-49)
- [Deterministic failure injection and recovery assertions](#read:fieldnotes-en-50)
- [Binary record framing and truncated input](#read:fieldnotes-en-51)
