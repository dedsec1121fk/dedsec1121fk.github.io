# Binary search — leftmost insertion point with a provable invariant

## Preconditions and use case
An offline index contains sorted numeric IDs. Search for the first position whose value is not less than the requested ID. If all values are smaller, return the length of the list. Duplicates must resolve to the leftmost position, not an arbitrary matching element. Sorting is a precondition: using binary search on unsorted input can return a plausible but incorrect answer.

## Executable Python 3 fixture
Save as binary_search_lab.py and run python3 binary_search_lab.py. The independently implemented function is compared with the standard-library bisect_left on empty arrays, repeated values and values before, inside and after the indexed range.

~~~python
from bisect import bisect_left

def lower_bound(items, target):
    low, high = 0, len(items)
    while low < high:
        mid = (low + high) // 2
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid
    return low

for row, targets in [
    ([], [-1, 0]),
    ([1,1,2,4], [0,1,2,3,4,5]),
    ([-5,0,0,8], [-8,-5,0,1,9])
]:
    for target in targets:
        index = lower_bound(row, target)
        assert index == bisect_left(row, target)
        assert all(value < target for value in row[:index])
        assert all(value >= target for value in row[index:])
print("PASS: leftmost insertion, duplicates, empty and boundaries")
~~~

## Why the algorithm is correct
At every iteration the interval [low, high) contains the earliest valid insertion point. Values strictly before low are less than target; values at or beyond high are greater than or equal to it. If items[mid] is less than target, the earliest candidate must lie after mid, so advance low to mid+1. Otherwise the candidate is at mid or earlier and high becomes mid. The interval strictly shrinks until low equals high. With n sorted elements the loop uses O(log n) comparisons and O(1) auxiliary space; slicing inside the tests does not belong to the algorithm's runtime cost.

## Bounded investigation and diagnostics
1. Change the comparison from less-than to less-than-or-equal. Observe how a duplicate search now yields an upper insertion point instead of the leftmost.
2. Test empty input, one value, all duplicates, negatives and absent targets. State the return index for each before running the function.
3. Try an unsorted fixture, document the violated precondition, and decide whether callers must sort or the API should raise.
4. Add a binary-search variant returning a matching index or None. Explain why the leftmost insertion interface can also support range queries.

**Evidence:** PASS, interval invariant, 10+ edge-case comparisons and the distinction between lower and upper bounds.
