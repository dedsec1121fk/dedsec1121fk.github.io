# Glossary: heaps, HTTP and idempotence

## Heap

### Meaning and constraints
The word heap has two separate uses: the dynamic memory region used for allocations, and a priority-queue data structure. A binary min-heap stores a partial ordering that makes the smallest key accessible efficiently; it does not keep every element globally sorted.

### A concrete use
~~~python
import heapq
items = [9, 2, 5, 1]
heapq.heapify(items)
assert heapq.heappop(items) == 1
assert heapq.heappop(items) == 2
~~~

### Challenge and misconception
Print the internal heap list after heapify and prove it need not be sorted. Distinguish the O(log n) push/pop operations from a memory allocation on the process heap.

**Further reading:** https://docs.python.org/3/library/heapq.html

## HTTP

### Meaning and constraints
HTTP defines a client-server exchange of methods, target resources, headers, status codes and possibly bodies. HTTP is stateless at the protocol layer; applications can correlate requests using cookies, tokens and server-side sessions. A 200 status does not certify that JSON data has the right schema.

### A concrete use
~~~http
GET /status HTTP/1.1
Host: example.test
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"ok":true}
~~~

### Challenge and misconception
Sketch separate responses 200, 404, 429 and 503. Describe which failures can be retried, when Retry-After matters, and why CORS is a browser enforcement mechanism rather than an HTTP authentication system.

**Further reading:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

## Idempotence

### Meaning and constraints
An operation is idempotent when repeating it has the same intended effect as doing it once. Setting a flag to true is idempotent, whereas incrementing a counter ordinarily is not. In HTTP, method idempotence is about intended server effects, not necessarily identical response bytes.

### A concrete use
~~~python
state = {'enabled': False, 'counter': 0}
def enable(): state['enabled'] = True
def increment(): state['counter'] += 1
enable(); enable(); assert state['enabled'] is True
increment(); increment(); assert state['counter'] == 2
~~~

### Challenge and misconception
Design an API endpoint that accepts an idempotency key for a payment-like test action. Model a repeated request after a network timeout and prevent accidental duplicate writes; don't use real payment services.

**Further reading:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Idempotent

## Immutable

### Meaning and constraints
An immutable value cannot be changed in place through its exposed interface. Python tuples are immutable containers but may contain references to mutable objects; immutability of the outer tuple does not recursively freeze everything it contains.

### A concrete use
~~~python
items = ([1,2],)
items[0].append(3)
assert items == ([1,2,3],)
# items[0] = [4]  # TypeError: tuple assignment is forbidden
~~~

### Challenge and misconception
Compare a frozen dataclass with a regular one, then test a frozen field that holds a list. Decide when a deep immutable representation is needed for safe caching or cross-thread messaging.

**Further reading:** https://docs.python.org/3/library/stdtypes.html#tuples

## Index

### Meaning and constraints
An index can be a position into an ordered collection or a separate data structure accelerating database lookups. Python sequence indexes usually start at zero and negative indexes count from the end; a database index instead stores searchable keys and references to records.

### A concrete use
~~~python
words = ['first', 'second', 'third']
assert words[0] == 'first'
assert words[-1] == 'third'
assert words[1:3] == ['second', 'third']
~~~

### Challenge and misconception
Try words[3] and record IndexError. Then create an indexed SQLite column and compare EXPLAIN QUERY PLAN before and after, noting that an optimizer may avoid an index for a tiny table.

**Further reading:** https://docs.python.org/3/library/stdtypes.html#common-sequence-operations
