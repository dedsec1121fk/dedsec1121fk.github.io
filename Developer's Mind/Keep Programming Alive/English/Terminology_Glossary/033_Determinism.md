# Glossary: determinism, dictionaries and dynamic types

## Determinism

### Concept in practice
A deterministic computation produces the same observable result for the same inputs and relevant environment. Random seeds can help reproduce pseudo-random sequences, but do not control clocks, thread scheduling, filesystem ordering or changing external services.

### Focused example
~~~python
import random
first = random.Random(17).sample(range(100), 5)
second = random.Random(17).sample(range(100), 5)
assert first == second
~~~

### Exercise and common pitfall
Remove the explicit seed and observe possible variation, then sort an unordered collection before comparing output. For tests with dates, inject a fixed clock instead of depending on the current time. Explain which dependencies still prevent complete reproducibility.

**Reference:** https://docs.python.org/3/library/random.html

## Dictionary

### Concept in practice
A dictionary associates unique keys with values and typically supports efficient lookup by key. In Python, keys must be hashable, and assigning to an existing key replaces its value. Lookup performance is usually good on average but not a contractual constant-time guarantee in all circumstances.

### Focused example
~~~python
totals = {}
for name in ['Ada', 'Grace', 'Ada']:
    totals[name] = totals.get(name, 0) + 1
assert totals == {'Ada': 2, 'Grace': 1}
~~~

### Exercise and common pitfall
Try using a list as a dictionary key and record the resulting TypeError. Compare `d.get(k)` with `d[k]` when a key is absent; distinguish legitimate missing data from a default zero.

**Reference:** https://docs.python.org/3/tutorial/datastructures.html#dictionaries

## Dynamic typing

### Concept in practice
In dynamically typed languages such as Python, values carry types and names may refer to different types over time. This is not the same as having no type rules; incorrect operations still raise errors at runtime. Optional static annotations can help tooling without converting Python into a statically enforced runtime.

### Focused example
~~~python
value = 3
value = 'three'
assert isinstance(value, str)
try:
    _ = value + 1
except TypeError: pass
else: raise AssertionError('expected a type error')
~~~

### Exercise and common pitfall
Design a function accepting unknown JSON and validate with isinstance before arithmetic. Compare its runtime behavior with a type-checker warning on `value + 1`; avoid treating type hints as automatic input validation.

**Reference:** https://docs.python.org/3/library/typing.html

## Encapsulation

### Meaning and constraints
Encapsulation places state and the operations that preserve its rules behind a deliberate interface. Python's leading underscore is a convention, not hard access control. Clients should call methods that preserve an invariant rather than mutating internal fields directly.

### A concrete use
~~~python
class Balance:
    def __init__(self): self._cents = 0
    def add(self, cents):
        if type(cents) is not int or cents < 0: raise ValueError('invalid amount')
        self._cents += cents
    @property
    def cents(self): return self._cents
b = Balance(); b.add(25); assert b.cents == 25
~~~

### Challenge and misconception
Try add(-1) and add(True). Explain why direct assignment to `_cents` is still technically possible, so an API boundary must also enforce caller privileges where relevant.

**Further reading:** https://docs.python.org/3/tutorial/classes.html#private-variables
