# Property-based testing — seeded cases plus explicit invariants

## Subject under test
Build a stable deduplication routine: preserve each distinct hashable value once, in the order of its *first* appearance. A few handwritten examples cannot exercise every sequence length and repetition pattern. Generate many bounded examples with a fixed pseudorandom seed so a failure is reproducible. Compare with an independent standard-library oracle and also assert structural properties that should hold for every input.

## Executable Python 3 fixture
Save as property_lab.py and run python3 property_lab.py. The generator produces 100 sequences of up to 39 integers from 0 through 9, so there is no external service or unbounded random work.

~~~python
import random

def unique(items):
    seen, result = set(), []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

rng = random.Random(17)
for _ in range(100):
    xs = [rng.randrange(10) for _ in range(rng.randrange(40))]
    result = unique(xs)
    assert result == list(dict.fromkeys(xs))
    assert unique(result) == result
    assert set(result) == set(xs)
    positions = [xs.index(value) for value in result]
    assert positions == sorted(positions)
assert unique([]) == []
print("PASS: seeded properties and order preservation")
~~~

## What makes a useful property
Idempotence: deduplicating an already deduplicated list changes nothing. Membership preservation: the output contains exactly the set of input values. Order preservation: the first appearance positions must be strictly increasing. These properties do not prove correctness in every case, and the standard-library dict reference may share assumptions with the implementation. Independent specifications and hand-picked edge cases remain necessary. A seed makes the run repeatable, but a real property-based library can also shrink a failing sample into a smaller counterexample.

## Bounded experiments
1. Intentionally reverse the resulting list and verify which property notices the defect; a mere membership check will miss ordering bugs.
2. Include empty input, only repeated values and all-unique values. Record which tests are deterministic.
3. Try unhashable list values. Decide whether the contract rejects them or needs an alternative equality-only algorithm.
4. Increase the seed count and record the first failing seed for a deliberately mutated implementation. Explain how shrinking helps debugging.

**Evidence:** PASS, four independently stated properties, a reproducible seed and at least one mutation detected by a property.
