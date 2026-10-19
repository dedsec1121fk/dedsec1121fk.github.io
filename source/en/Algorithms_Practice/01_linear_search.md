# Algorithm drills — linear/binary search and frequency maps

## Linear search

### Reference implementation (Python 3)
~~~python
def find_index(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1
assert find_index([4, 8, 2], 8) == 1
assert find_index([], 8) == -1
~~~

### Mechanism and invariant
Scan the list from index zero and compare each element with the target. At the start of iteration i, no earlier index contains a matching value; returning immediately therefore finds the **first** match. A missing value returns -1 as a chosen interface contract, not a Python indexing operation. The worst-case number of equality comparisons is n, so time is O(n) and extra storage O(1).

### Run the adjacent reference
The code below is also stored as 01_linear_search.py and contains executable assertions. The algorithm works on unsorted collections; sorting a list solely to make one lookup faster would add work and could change original indices.

### Boundary laboratory
1. Input [] with target 8 returns -1; zero comparisons occur.
2. Input [8,8,3] with target 8 returns 0, not 1. Duplicate matches must preserve first-index semantics.
3. Input [4,8,2] with target 2 returns 2; this is the worst case for a present target.
4. Instrument the loop to count equality operations for targets at the start, end and absent from lists of length 10, 100 and 1000. Explain the linear growth.
5. Decide whether None, strings and integers may coexist. Python equality rules are part of the comparison contract and differ from a typed database lookup.

### Transfer and completion
For many repeated queries, build an index mapping each key to its first position and account for O(n) preparation/storage; the index is only valid until the collection changes. Record actual comparison counts and duplicate handling before claiming an optimization. Run the Python assertions, then add the four negative and boundary tests.

## Binary search

### Reference implementation (Python 3)
~~~python
def binary_search(items, target):
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] < target: lo = mid + 1
        else: hi = mid
    return lo if lo < len(items) and items[lo] == target else -1
assert binary_search([1, 3, 5, 7], 5) == 2
~~~

### Invariant
The reference implementation searches a half-open interval [lo, hi). Every step retains the **first index whose value is not less than target**. When items[mid] is smaller, no index up to mid can work, so lo becomes mid+1; otherwise hi becomes mid. At termination lo equals hi. Only then do we test whether the value actually equals the target.

### Correctness and complexity
Each iteration approximately halves the candidate range, giving O(log n) comparisons and O(1) extra memory. This assumes ascending sorted input and a comparison relation that behaves consistently. A valid list with duplicates returns their **leftmost** index because the high boundary moves left on equality.

### Controlled test cases
1. [1,3,5,7] and target 5 return 2. Record lo, hi and mid at each iteration.
2. [2,2,2] and target 2 return 0. Contrast this with a naive implementation that stops on its first arbitrary middle match.
3. [] and target 1 return -1; [1,3] and target 9 also return -1.
4. Test target smaller than the first element; the insertion position is zero but the search return remains -1.
5. Deliberately provide [3,1,2]. The sorted-input precondition is violated; explain that no index can be trusted rather than reporting a successful algorithm test.

### Extend responsibly
Expose a separate lower_bound API if callers need insertion positions. Test index boundaries with an even and odd number of elements, then compare lookup counts against linear search. For floating-point NaN values, ordering needs an explicit policy because ordinary comparisons do not provide the required total order.

## Frequency map

### Reference implementation (Python 3)
~~~python
from collections import Counter
counts = Counter('banana')
assert counts['a'] == 3
print(counts)
~~~

### Problem
Given a stream of values, return how often each distinct key occurs. The reference uses collections.Counter over the string banana: a occurs 3 times, n twice and b once. A hash-based Counter usually builds counts in O(n) expected time with O(k) storage for k distinct keys; the worst case depends on hash behavior and input.

### Interpret the example
A Python string iterates Unicode code points rather than grapheme clusters. Counting bytes of UTF-8, case-folded text or whole words answers different questions. Decide the unit of counting **before** choosing a key or normalization rule. Counter returns zero for a missing key without inserting the key, unlike plain dict indexing.

### Experiments
1. Check counts['a']==3 and counts['z']==0; verify the number of distinct keys is 3.
2. Compare Counter('Aa') with Counter('Aa'.casefold()). The second merges ASCII case, which may or may not match requirements.
3. Count 10000 repeated a characters. Memory should grow with the number of unique keys, not total repetitions, apart from input storage.
4. Count a list of normalized log statuses such as ['ok','fail','ok'] and describe how missing/unknown statuses should be reported.
5. Write the same algorithm with an ordinary dict.get(key,0)+1 loop, then compare counts without assuming that the more compact API is always faster.

### Reporting
For large logs process an iterable incrementally and record whether the system stores the entire input. Where data is untrusted, cap input size and consider cardinality limits. Preserve the raw value if downstream users need to audit what normalization changed.

## 01 linear search — boundary study

When duplicates are allowed, the loop returns the first matching index. Distinguish absence (-1) from an index of 0; never test the result with `if index:` because zero is falsey. Equality uses the type's `==` implementation, so compare compatible values.

Test `[9,9]` looking for 9 (answer 0), an empty list (answer -1), and a missing value. No sorting is required.

<!-- [curated-algorithm-detail:01_linear_search.md] -->

## 02 binary search — boundary study

The algorithm needs ascending sorted data. Its interval is half-open `[lo,hi)`, so the invariant is that every candidate position remains inside this interval. At termination `lo` is the lower-bound insertion point and may equal `len(items)`.

Try `[1,2,2,2,4]` searching for 2: the first occurrence is index 1. Searching for 3 must return -1 rather than the insertion point.

<!-- [curated-algorithm-detail:02_binary_search.md] -->

## 03 frequency map — boundary study

A frequency map counts all occurrences without repeatedly scanning the entire collection. Dictionary keys must be hashable. For human-entered text, decide whether `A` and `a`, accented characters or spaces should count separately before counting.

Build `Counter('aabbc')`: counts are a=2, b=2, c=1. A missing key produces zero from Counter. Hash-table memory grows with the number of distinct values.

<!-- [curated-algorithm-detail:03_frequency_map.md] -->
