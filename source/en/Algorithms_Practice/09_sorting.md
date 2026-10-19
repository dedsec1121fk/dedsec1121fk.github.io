# Algorithm drills — sorting, dynamic programming and prefix sums

## Stable sorting

### Python 3 reference program
~~~python
items = [('Ada', 2),('Grace', 1),('Linus', 2)]
items_sorted = sorted(items, key=lambda item: item[1])
assert items_sorted == [('Grace',1),('Ada',2),('Linus',2)]
~~~

### Core property
Python sorted returns a new list and is stable: records that compare equal under the chosen key keep their **original relative order**. In the reference data, Ada and Linus share priority 2, so both remain in that order after Grace with priority 1.

### Why the key matters
The key function lambda item: item[1] selects the second element of each pair. It does not compare names unless names are explicitly included in a compound key. Adding a secondary key (item[1], item[0]) changes the definition of ties and may deliberately reorder records. Sorting the same list in place with list.sort mutates the original; sorted does not.

### Counterexamples
1. Verify sorted order Grace, Ada, Linus, and confirm items still matches the original sequence.
2. Add a second record with priority 1 and check that these two tie records preserve their insertion order.
3. Sort by name instead and state the different result. The algorithm was not 'wrong'—the comparison contract changed.
4. Add a missing priority value and design an explicit policy for missing keys instead of allowing an IndexError.
5. Mixed incomparable key types (for example, integer and string priorities) may produce TypeError in Python 3; validate or normalize before sorting.

### Complexity and verification
General comparison sorting needs O(n log n) comparisons in the worst case; Python's actual Timsort can exploit existing order. For a leaderboard, decide explicitly how ties must be broken and whether a stable sort is required. Test an empty list, one record, duplicates and original-input preservation.

## Dynamic programming

### Python 3 reference source
~~~python
def fibonacci(n):
    if n < 0: raise ValueError('n must be >= 0')
    a, b = 0, 1
    for _ in range(n): a, b = b, a + b
    return a
assert [fibonacci(n) for n in range(7)] == [0,1,1,2,3,5,8]
~~~

### Recurrence and invariant
F(0)=0 and F(1)=1; for n≥2, F(n)=F(n-1)+F(n-2). An exponential naive recursive implementation recalculates the same subproblems. The reference instead stores a=F(i), b=F(i+1) at the beginning of each loop iteration and advances both using parallel assignment. After n iterations, a equals F(n).

### Complexity and numeric cost
The loop makes n additions and keeps only two integer variables, so it is O(n) iterations and O(1) **integer slots**. That is not literally O(1) bits: Fibonacci values increase in size and arbitrary-precision integer arithmetic gets more expensive for very large n. The contract rejects negative n explicitly.

### Experiments
1. For n=0..6, the outputs are [0,1,1,2,3,5,8]; the original assertions cover this sequence.
2. Pass n=-1 and expect ValueError; never silently return the value of F(0) for an invalid request.
3. Compare fibonacci(10) against a memoized recursive version and record function-call counts rather than only elapsed times.
4. Implement a version with a full DP table. It can be useful for reconstructing intermediate states but consumes O(n) slots.
5. For very large n, profile integer size in bits and discuss why the simplified constant-space claim has a computational caveat.

### When this pattern transfers
The deeper pattern is identifying overlapping subproblems, defining a recurrence, selecting a base case and proving transitions. Not every dynamic program can be reduced to two variables; many require tables or reconstruction links. Document the invariant that justifies a memory optimization.

## Prefix sums

### Python 3 reference source
~~~python
values = [4, 6, 2, 5]
prefix = [0]
for number in values: prefix.append(prefix[-1] + number)
def range_sum(left, right):
    if not (0 <= left <= right <= len(values)): raise ValueError('range')
    return prefix[right] - prefix[left]
assert range_sum(1, 3) == 8
~~~

### Representation
Given values [4,6,2,5], construct prefix [0,4,10,12,17]. By definition prefix[i] is the sum of elements strictly before index i. The zero at the beginning is essential: it lets the same formula handle ranges that start at index zero.

### Query invariant and cost
The sum of the half-open slice values[left:right] equals prefix[right]-prefix[left]. For left=1,right=3 that is 12-4=8, representing 6+2. Building the prefix table takes O(n) time and O(n) extra memory. Each validated range query then costs O(1) time, which is useful when many queries target an unchanged array.

### Boundary experiments
1. range_sum(0,0) returns 0 because an empty interval sums to the additive identity.
2. range_sum(0,len(values)) returns 17, the total.
3. range_sum(1,3) returns 8, and range_sum(3,4) returns 5.
4. Reject left>right, negative left or right beyond the list with ValueError. Do not depend on Python negative indexing accidentally changing semantics.
5. Change values[1] after building prefix. The old table becomes stale; recompute or choose another data structure.

### Beyond static arrays
For frequent updates mixed with queries, consider a Fenwick tree or segment tree and explain the O(log n) trade-off. For overflow-limited languages choose a sum type wide enough for the largest possible accumulated value. Verify boundaries before subtracting prefix indices.

## Text normalization

### Python 3 reference source
~~~python
import unicodedata
composed = "é"
decomposed = "e\u0301"
assert composed != decomposed
assert len(composed) == 1 and len(decomposed) == 2
assert unicodedata.normalize("NFC", composed) == unicodedata.normalize("NFC", decomposed)
~~~

### Mechanism
A visible é can be represented by the single code point U+00E9 or by U+0065 (e) followed by U+0301 (combining acute accent). These strings differ byte-for-byte and have different Python lengths, yet Unicode considers them canonically equivalent. unicodedata.normalize('NFC', text) composes eligible sequences into a common representation.

### Why this does not replace validation
Normalization is an explicit policy decision for comparison and storage. It does not detect homoglyph phishing, perform locale-aware sorting or automatically make every string safe for an identifier. Case folding is a separate operation. Some data must preserve its exact original bytes for signatures or forensic logs.

### Test cases
1. Check that the original composed/decomposed strings differ, then become equal after NFC normalization.
2. Compare their code point counts (1 versus 2) and UTF-8 bytes before and after transformation.
3. Use NFD instead of NFC and observe decomposed output; the canonical equivalence relation should still hold.
4. Normalize a plain ASCII identifier and assert it does not change.
5. Choose a policy for repository filenames and searchable titles; store both the normalized index key and the original display text if exact spelling matters.

### Real use
Apply normalization at a single documented boundary and avoid repeatedly transforming already recorded source material. Test Greek accents and combining marks with synthetic samples. Record Unicode/Python version and the chosen normalization form when reproducibility matters.

## 09 sorting — boundary study

Stable sorting preserves the original order among records whose key compares equal. This allows multi-stage sorting: sort by secondary key first, then by primary key, retaining secondary order within ties.

`sorted()` returns a new list, while `.sort()` mutates the input. Key values need a consistent comparison; mixing incomparable `None` and integers raises a TypeError.

<!-- [curated-algorithm-detail:09_sorting.md] -->

## 12 fibonacci dp — boundary study

Dynamic programming replaces repeated recomputation with remembered results. For Fibonacci, storing only the two most recent values is enough to calculate the next number, reducing auxiliary memory to constant space.

Agree on the indexing convention first: F(0)=0 and F(1)=1. Validate n=0, n=1, n=2 and large n, noting that integer values become very large even when memory remains O(1).

<!-- [curated-algorithm-detail:12_fibonacci_dp.md] -->

## 13 prefix sums — boundary study

With `prefix[0]=0` and `prefix[i+1]=prefix[i]+values[i]`, the sum of half-open range `[left,right)` is exactly `prefix[right]-prefix[left]`. The extra initial zero removes special handling for a range starting at index zero.

A preprocessing pass is O(n) and each range query is O(1). Validate `left<=right<=n`, including an empty range where both indices are equal.

<!-- [curated-algorithm-detail:13_prefix_sums.md] -->

## 14 safe text normalization — boundary study

Normalization is a deliberate data rule, not an automatic security cure. Unicode NFC can unify equivalent compositions, and `.casefold()` helps case-insensitive comparisons; neither automatically makes look-alike characters identical.

Before normalizing usernames, decide whether accent distinctions matter. Preserve original input for audit, reject unwanted control characters and test visually similar non-identical strings.

<!-- [curated-algorithm-detail:14_safe_text_normalization.md] -->
