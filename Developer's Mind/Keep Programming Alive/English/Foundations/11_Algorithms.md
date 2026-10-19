# Algorithms and complexity

Estimate how work scales with input size. One pass through n items is O(n); nested full passes are usually O(n²). A correct, readable O(n) program is often better than premature optimization.

## Worked example

```text
def find_item(items, wanted):
    for item in items:
        if item == wanted:
            return True
    return False

print(find_item([2, 4, 8], 4))
```

## Practice

What is the worst-case number of comparisons for 100 elements?

## Corrected result / hint

Up to 100 comparisons (linear time).

## Complexity is a model, not a stopwatch
Big-O describes growth as inputs scale. A nested loop may be O(n²); a hash lookup is expected average O(1) but depends on hashing; a sort is typically O(n log n). Always specify n and which operation counts. Storage also matters: materializing all rows versus streaming can change memory from O(n) to O(1).
```python
def duplicates(values):
    seen=set()
    for value in values:
        if value in seen:return True
        seen.add(value)
    return False
assert duplicates([2,4,2])
assert not duplicates([2,4,6])
```
This algorithm uses average O(n) time and O(n) extra space. Compare to a double nested scan (O(n²) time, O(1) extra memory).

**Exercise:** generate lists of length 100, 1,000 and 10,000. Record median time from multiple trials, control warm-up, and explain why microbenchmarks never prove the asymptotic bound alone.

## Lower-bound search and its invariant

~~~python
def lower_bound(items, target):
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
assert lower_bound([], 4) == 0
assert lower_bound([1, 3, 3, 8], 3) == 1
assert lower_bound([1, 3, 3, 8], 4) == 3
~~~

The contract requires sorted input. Each iteration preserves the range of possible answers and shortens it; duplicates must not accidentally return the last match. The returned insertion position does **not** establish that the target exists. Compare this algorithm with a linear scan over randomly generated sorted lists using a reproducible seed, including empty input and out-of-range targets. Sorting a fresh input for every query costs `O(n log n)`, not the `O(log n)` of the search alone. Reference: https://docs.python.org/3/library/bisect.html
