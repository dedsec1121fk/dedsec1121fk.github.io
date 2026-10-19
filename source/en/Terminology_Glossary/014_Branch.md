# Glossary: branches, buffers and bytes

## Branch

### How this concept behaves
Control-flow choice selecting one path based on a condition. A Git branch is a different concept: a movable reference to commit history, not a conditional statement.

### Work through a small example
~~~text
def label(score):
    if score>=50:return 'pass'
    return 'retry'
assert label(50)=='pass'
~~~

### Investigate the behavior
Test scores 49 and 50, then compare coverage of both if branches. Explain what testing only one path misses.

### Explain a boundary case
For Branch, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Buffer

### How this concept behaves
Memory region holding data between producer and consumer speeds. Buffers have capacity limits; unchecked writes can corrupt memory in low-level languages.

### Work through a small example
~~~text
from collections import deque
buffer=deque(maxlen=2)
buffer.append('a');buffer.append('b')
assert list(buffer)==['a','b']
~~~

### Investigate the behavior
Push a third element and observe bounded deque eviction. Compare overwrite-oldest policy with queue backpressure.

### Explain a boundary case
For Buffer, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Byte

### How this concept behaves
A group of eight bits in modern platforms; file lengths count bytes, while strings may count Unicode code points. UTF-8 characters can require multiple bytes.

### Work through a small example
~~~text
s='Γ'; encoded=s.encode('utf-8')
assert len(s)==1
assert len(encoded)==2
~~~

### Investigate the behavior
Compute UTF-8 bytes of ASCII, Greek and emoji, then inspect hex values. Do not split encoded text in arbitrary byte positions.

### Explain a boundary case
For Byte, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Cache

### How this concept behaves
Stored reuse of expensive or remote results. Cache correctness depends on keys, freshness and invalidation; a fast stale value can be less useful than a slower accurate result.

### Work through a small example
~~~text
from functools import lru_cache
@lru_cache(maxsize=16)
def square(n):return n*n
assert square(3)==9
assert square(3)==9
~~~

### Investigate the behavior
Inspect cache_info().hits before and after repeated calls. Explain why this cache cannot safely represent changing user permissions.

### Explain a boundary case
For Cache, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Callback

### How this concept behaves
Function passed to another component for later invocation, such as a button handler or completion callback. Execution context, ordering and lifetime belong to the contract.

### Work through a small example
~~~text
def apply(value, callback):return callback(value)
assert apply(4,lambda n:n*2)==8
~~~

### Investigate the behavior
Pass two callbacks that produce different outputs and test what happens if the callback raises an exception.

### Explain a boundary case
For Callback, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.
