# Choosing data structures from the operations you actually need

A stack processes the most recently added item first (LIFO). A queue processes the oldest item first (FIFO). A hash-based set is useful for membership tests, but doesn't preserve all duplicate occurrences. These aren't just names: the desired operations determine both correctness and cost.

## A runnable FIFO example in Python

~~~python
from collections import deque

pending = deque(["first", "second"])
pending.append("third")
assert pending.popleft() == "first"
assert pending.popleft() == "second"
assert list(pending) == ["third"]
~~~

A deque is appropriate because removing from its left end is efficient. Repeatedly removing index zero from a Python list shifts the remaining elements, giving linear-time work for each removal. A list is still a good stack with append and pop at the right end. Be explicit about which end your application reads from before choosing a container.

## Test an invariant rather than just printing

A queue should return enqueued items in enqueue order. For an empty queue, popleft raises IndexError, so an application needs a deliberate policy: check before removing or catch the exception. An undo history instead uses a stack so the most recent edit is reverted first. Model the difference with the sequence A, B, C: the queue returns A; the stack returns C.

## Sets, dictionaries, and misleading performance claims

For repeated membership checks on many distinct identifiers, a set usually offers average constant-time lookup, whereas searching a list is linear in its length. Hash collisions and adversarial inputs mean this average is not a universal worst-case bound. If you need to map product codes to counts, choose a dictionary, not a set. If you need every repeated event in its original order, don't replace the event log with a set.

## Independent exercise and expected evidence

Implement a simple task processor with four events, including a duplicate identifier. Predict the output order before execution. Add a cancellation operation by identifier and explain why removal by arbitrary value is different from popleft. Note the chosen Python version and compare time costs qualitatively as data grows; do not claim a benchmark that wasn't run.
