# Algorithmic complexity — compare operations before timings

## Contract and input size
A local search system must identify which requested labels exist in an index. Define n as the number of requests and m as the number of indexed labels. A nested scan may make n*m equality checks when every request misses. An alternative builds a hash set from the indexed labels in expected O(m) time and O(m) space, then performs expected O(1) lookups for each request. This extra allocation may not pay off for very small inputs.

## Executable Python 3 comparison
Save as complexity_lab.py and run python3 complexity_lab.py. The nested version reports its exact comparison count; both variants preserve repeated requested labels.

~~~python
def nested_lookup(left, right):
    found, comparisons = [], 0
    for item in left:
        for candidate in right:
            comparisons += 1
            if item == candidate:
                found.append(item)
                break
    return found, comparisons

def indexed_lookup(left, right):
    index = set(right)
    return [item for item in left if item in index]

left = ['a', 'b', 'z', 'a']
right = ['b', 'a']
found, steps = nested_lookup(left, right)
assert found == ['a', 'b', 'a'] and steps == 7
assert indexed_lookup(left, right) == found
assert nested_lookup([], right) == ([], 0)
try:
    indexed_lookup([[1]], [[1]])
except TypeError:
    pass
else:
    raise AssertionError('unhashable values were accepted')
print('PASS complexity: equivalent membership, measured comparisons')
~~~

## Interpreting the result
The fixture performs seven nested comparisons, including a full unsuccessful search for z. This does not mean seven comparisons always take the same duration on different hardware. Hash sets require hashable values and equality/hash compatibility; nested Python lists cannot serve as set elements. A pathological hash function can degrade expected performance, so the expected O(1) average membership cost is not an unconditional worst-case bound.

## Exercises and diagnostic experiments
1. Run with n=100, 1000 and 5000 unmatched requests. Keep m fixed, then set m=n. Explain why comparison counts change.
2. Put the most frequent request at the front and back of the right-hand list. Count best and worst ordering effects.
3. Compare this output with a set intersection; explain why deleting repeated requests changes the program contract.
4. Use time.perf_counter for multiple warmed-up runs and log Python version, hardware and input shapes. State memory cost separately from elapsed time.

**Evidence:** PASS output, a small table of n, m and comparison counts, and a failure demonstration for unhashable input.
