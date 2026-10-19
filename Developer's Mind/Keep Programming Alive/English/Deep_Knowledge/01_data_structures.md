# Data structures — a bounded least-recently-used cache

## Concrete task
An offline knowledge viewer wants to retain its two most recently used lessons. Looking up a label in a list requires O(n) scanning; a hash map gives expected O(1) lookup but does not automatically track which entry was read most recently. Python OrderedDict supports key lookup and explicit recency updates. Define a fixed, positive integer capacity and evict the least recently used item when a new key exceeds it.

## Runnable Python 3 lab
Save as cache_lab.py and run python3 cache_lab.py. All state stays in memory and assertions check eviction, misses and the invalid capacity boundary.

~~~python
from collections import OrderedDict
MISSING = object()
class Cache:
    def __init__(self, capacity):
        if type(capacity) is not int or capacity < 1:
            raise ValueError('positive integer capacity required')
        self.capacity = capacity
        self.items = OrderedDict()
    def get(self, key):
        if key not in self.items:
            return MISSING
        self.items.move_to_end(key)
        return self.items[key]
    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            return self.items.popitem(last=False)
        return None
c = Cache(2)
assert c.get('a') is MISSING
assert c.put('a', None) is None
assert c.get('a') is None
c.put('b', 2)
assert c.get('a') is None
assert c.put('c', 3) == ('b', 2)
assert list(c.items) == ['a', 'c']
try:
    Cache(0)
except ValueError:
    pass
else:
    raise AssertionError('zero capacity was accepted')
print('PASS cache: eviction, missing sentinel, recency')
~~~

## Memory and semantics
Both get and put are expected O(1) and storage is O(capacity). Merely using a normal insertion-ordered dict would not make reads update recency. The unique MISSING sentinel is essential because None is a legitimate stored value: returning None for an absent key would make the two states indistinguishable. The implementation does not synchronize simultaneous writers, so concurrent callers require a lock or a separate ownership boundary.

## Bounded experiments and diagnostics
1. Set capacity to one and insert three keys. Predict which survives; then update an existing key and verify it becomes most recent.
2. Compare equality and identity for two distinct lists. Discuss why mapping keys must be hashable while stored values may be mutable.
3. Replace OrderedDict with a list of pairs, inspect worst-case key lookup, and explain the memory/time tradeoff for 10,000 keys.
4. Test Cache(0), Cache(True) and a non-integer capacity. Explain why exact type checks reject booleans even though bool subclasses int in Python.

**Evidence:** printed PASS, observed eviction order, a missing-versus-None test and a stated maximum memory budget for an offline cache.
