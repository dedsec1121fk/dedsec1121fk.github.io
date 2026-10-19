# Glossary: JSON, lazy evaluation and linters

## JSON

### Definition and boundaries
A standard text encoding for objects, arrays, strings, numbers, booleans and null. JSON syntax is not JavaScript object-literal syntax: comments and trailing commas are invalid. A parser verifies grammar rather than the application's schema.

### Working miniature
~~~text
import json
d=json.loads('{"active":true,"count":3}')
assert d['active'] is True
assert type(d['count']) is int
~~~

### Guided investigation
Test duplicate keys, a top-level list and an unknown field. Add separate schema validation that checks exact keys; default json.loads normally retains the last duplicated key.

## Lazy evaluation

### Definition and boundaries
Computation deferred until a result is demanded. Python generators yield incrementally, while Haskell uses non-strict evaluation more broadly. Delayed work changes when errors and side effects occur.

### Working miniature
~~~text
def numbers():
    yield 2
    yield 4
it=numbers()
assert next(it)==2
assert list(it)==[4]
~~~

### Guided investigation
Add a print before the first yield. Confirm it does not run at generator creation and that the iterator is exhausted after consumption.

### Check your understanding
For Lazy evaluation, change one input in the example and explain whether the observed behavior still satisfies the stated definition. Record the exact output and distinguish a program error from a mistaken assumption.

## Linter

### Definition and boundaries
Tool that checks source code against configurable static rules. It may find unused imports and suspicious constructs without executing the application; this does not replace behavioral testing or type checking.

### Working miniature
~~~text
def ratio(total, used):
    if total <= 0: raise ValueError('invalid total')
    return used/total
assert ratio(4,2)==0.5
~~~

### Guided investigation
Insert an unused variable into a scratch file, run a suitable linter and remove it without changing the validation. Compare warning output with an actual failing unit test.

## List

### Definition and boundaries
Ordered collection preserving element positions. Python's list is a mutable dynamic array with fast indexing; inserting at the beginning can shift the rest of the elements. Other languages may implement linked lists differently.

### Working miniature
~~~text
names=['Ada','Grace']; names.append('Lin')
assert names[-1]=='Lin'
assert names[1:]==['Grace','Lin']
~~~

### Guided investigation
Compare append with insert(0, item) for a longer list. Copy a nested list shallowly, modify an inner list and observe shared references.

## Lock

### Definition and boundaries
Synchronization primitive guarding a critical section against concurrent mutation. A lock protects only the operations that consistently acquire it; it cannot automatically protect external state or turn multiple SQL statements into a transaction.

### Working miniature
~~~text
from threading import Lock
lock=Lock(); count=[0]
with lock: count[0]+=1
assert count==[1]
~~~

### Guided investigation
Run concurrent increments using the same lock. Then sketch how two threads acquiring locks A/B in opposite orders can deadlock.

### Four competing threads and one protected section
A lock protects a read-modify-write operation among cooperating threads. It guarantees exclusion, not scheduling order.

~~~python
from threading import Thread, Lock
mutex, counter = Lock(), [0]
def run():
    for _ in range(1000):
        with mutex:
            counter[0] += 1
jobs = [Thread(target=run) for _ in range(4)]
for t in jobs: t.start()
for t in jobs: t.join()
assert counter[0] == 4000
~~~

Extend the experiment with a count of workers currently inside the protected section; maximum concurrency there must be one. A standard Lock is not reentrant; acquiring it twice from one thread can deadlock. Do not hold the lock while awaiting network services.
