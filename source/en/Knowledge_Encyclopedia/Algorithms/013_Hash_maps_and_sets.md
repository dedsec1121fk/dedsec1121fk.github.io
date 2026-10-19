# Algorithms and collections — hashing, queues and ordering

## Hash maps and sets

### Mechanism and scope
Hash maps associate keys with values and sets track membership. Average hash lookup is often O(1), but equality/hash rules matter and an adversarial collision pattern can affect performance.

### Implementation example
~~~python
from collections import Counter
counts=Counter(['red','blue','red'])
assert counts['red']==2
assert {'red','blue'}==set(counts)
~~~

### Reproduce and investigate
Implement duplicate detection with a set, then compare against nested-list searches. Test hashability of a list as a key and identify TypeError.

### Evidence to record
For Hash maps and sets, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.

## Stacks and queues

### Mechanism and scope
A stack processes newest items first (LIFO); a queue processes oldest first (FIFO). DFS is naturally stack-based and breadth-first traversal queue-based, so substituting one changes search order.

### Implementation example
~~~python
from collections import deque
s=[1,2]; q=deque([1,2]);
assert s.pop()==2
assert q.popleft()==1
~~~

### Reproduce and investigate
Validate parentheses using a stack, then schedule tasks using a deque. Explain why list.pop(0) differs in complexity from deque.popleft().

### Evidence to record
For Stacks and queues, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.

## Sorting and stable ordering

### Mechanism and scope
A stable sort keeps the prior relative order of elements that compare equal. This supports multi-key sorting by applying stable passes from least significant to most significant key.

### Implementation example
~~~python
rows=[('Ada',2),('Bob',1),('Carl',2)]
result=sorted(rows,key=lambda r:r[1]);
assert result==[('Bob',1),('Ada',2),('Carl',2)]
~~~

### Reproduce and investigate
Reverse input order of equal-score rows and inspect stability. Add a primary name sort followed by score sort; explain how order of passes changes the final result.

### Evidence to record
For Sorting and stable ordering, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.
## Further engineering detail

An ordered traversal needs a unique tie-breaker even when a hash map efficiently finds individual records. For paginated database results, persist the complete sort key in the cursor. This avoids confusing lookup identity with traversal order, especially when many events share one timestamp.

[Keyset pagination with stable ordering](#read:fieldnotes-en-38)
