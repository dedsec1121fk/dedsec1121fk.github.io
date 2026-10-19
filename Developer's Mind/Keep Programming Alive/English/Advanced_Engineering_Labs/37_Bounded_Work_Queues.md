# Bounded work queues and overload decisions

## Mechanism and contract

An unbounded queue converts overload into growing memory use and increasingly stale work. A bounded queue forces an explicit decision when producers outrun consumers: block briefly, reject, drop replaceable work or spill to a durable store. The right choice follows the meaning of the item. Dropping an old screen refresh can be reasonable; silently dropping a completed purchase is not.

Queue size is not the same as concurrency. One hundred buffered items with four workers still means four simultaneous operations. Budget item size as well as count: ten multi-gigabyte objects remain too large. The fixture uses nonblocking insertion to make overload observable rather than hanging. In concurrent code, qsize is a diagnostic snapshot, not a reliable permission to put or get; act on the operation's result.

## Worked local example

```python
from queue import Queue, Full
q = Queue(maxsize=2)
q.put_nowait("first")
q.put_nowait("second")
try:
    q.put_nowait("third")
except Full:
    rejected = True
else:
    rejected = False
assert rejected
assert q.get_nowait() == "first"
q.task_done()
print("overload observed")
```

## Failure checks and limits

Record accepted, rejected, completed and oldest-item age separately. Pair each successfully retrieved task with task_done, including failure paths; join otherwise waits indefinitely. Test shutdown while the queue is full and a consumer fails. A background worker should expose the failure to its owner instead of leaving producers blocked forever.

## Primary reference

[Official documentation](https://docs.python.org/3/library/queue.html)
