# Algorithm drills — two pointers, stacks and sliding windows

## Two pointers

### Reference implementation (Python 3)
~~~python
def pair_sum(values, target):
    i, j = 0, len(values) - 1
    while i < j:
        total = values[i] + values[j]
        if total == target: return (values[i], values[j])
        if total < target: i += 1
        else: j -= 1
    return None
assert pair_sum([1, 2, 4, 6, 8], 10) == (2, 8)
~~~

### Mechanism
The reference takes an ascending sorted list and a target sum. One pointer starts at the smallest value and one at the largest. If their sum is too small, increasing the left pointer is the only direction that can help; if too large, decreasing the right pointer is the only direction that can help. Stop when pointers meet: using the same element twice would be invalid.

### Complexity
With each step at least one pointer moves closer to the other, so the scan is O(n) time and O(1) extra space. Sorting an unsorted input first would add O(n log n) time (and possible memory), and it could change original indices. The returned pair is made of **values**, not original positions.

### Boundary experiments
1. Values [1,2,4,6,8], target 10 return (2,8). Explain which branch removes each candidate.
2. Values [1,3,5], target 10 return None even though 5+5=10; only one element has value 5.
3. Values [5,5], target 10 return (5,5), using two different indices.
4. Values [-5,-1,2,8], target 3 return (-5,8). Negative numbers do not invalidate the monotonic argument when the list is sorted.
5. Pass an unsorted list and explain why the pointer movement no longer proves correctness.

### Build an index-returning variant
For data needing provenance, return indices instead of values and preserve a mapping if sorting is required. Add property-based tests comparing your result to a simple O(n²) reference on small sorted lists, checking existence rather than one specific pair when several are valid.

## Balanced parentheses

### Reference implementation (Python 3)
~~~python
def balanced(text):
    stack, pairs = [], {')': '(', ']': '[', '}': '{'}
    for char in text:
        if char in '([{': stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]: return False
    return not stack
assert balanced('([])') and not balanced('([)]')
~~~

### Invariant
Read the input one character at a time. Push opening delimiters (, [ and { onto a stack. For each closing delimiter, the **latest unmatched opener** must match the corresponding type. Failure happens immediately if the stack is empty or the types differ; success requires the stack to be empty at the end.

### Scope and complexity
The provided function intentionally ignores non-bracket characters. It checks nesting, not full programming-language syntax: a parenthesis inside a quoted string would still count. Every character is visited once, so time is O(n) and worst-case stack memory O(n) when every character opens a group.

### Failing and passing cases
1. '([])' is valid; '([)]' is invalid because the first closing character mismatches the top of stack.
2. '(()' must fail at end-of-input, since an opener remains.
3. ')(' fails on the very first symbol because no opener exists.
4. '[{}]' succeeds; '[{]' fails because the closing bracket tries to match an unclosed brace.
5. 'text(a[b])' succeeds under the stated ignore-other-characters contract. Decide whether this is appropriate for source-code linting, where string literals/comments need tokenization.

### Follow-up implementation
Modify the function to return the index and reason for the first bad closer, or the positions of unmatched openers. Test 10000 nested brackets to show why an explicit stack avoids recursive parser depth limits. Do not confuse this simple delimiter checker with a full grammar parser.

## Sliding window

### Python 3 reference program
~~~python
def max_window_sum(values, k):
    if k <= 0 or k > len(values): raise ValueError('invalid window')
    current = sum(values[:k]); best = current
    for right in range(k, len(values)):
        current += values[right] - values[right-k]
        best = max(best, current)
    return best
assert max_window_sum([1,3,2,5,1],2) == 7
~~~

### Recurrence
For a window of k adjacent values, the next window differs by exactly two elements: remove the value leaving on the left and add the value entering on the right. If current is the old sum and right is the incoming index, new_sum = current + values[right] - values[right-k]. Each update is constant-time, so after the first k-item sum the scan is O(n).

### Understand actual costs
The reference computes sum(values[:k]). On a Python list, values[:k] creates a **copy of k references**, so this implementation uses O(k) temporary extra space despite constant-time updates. To achieve O(1) auxiliary space, replace that slice with a generator-based initial sum. This distinction matters when k is large.

### Boundary and negative tests
1. [1,3,2,5,1], k=2 has sums 4,5,7,6 and returns 7.
2. For k=1, the maximum window is the largest individual value.
3. For k=len(values), the answer is the sum of the whole list and only one window exists.
4. For k=0, negative k or k>len(values), expect ValueError. Empty input cannot contain a positive-length window.
5. Test all-negative values [-5,-2,-7], k=2. Initialize best to the first window, **not zero**, so the result is -7.

### Extension
For variable-size windows based on a sum threshold, the usual two-pointer monotonic proof needs nonnegative data. With negative values the window sum can decrease when extended, so use a different algorithm or justify a stronger invariant. Test inputs against a simple reference that enumerates every length-k window.

## 04 two pointers — boundary study

The two-pointer sum method works because the array is sorted: a sum too small must advance the left pointer, while a sum too large must decrease the right pointer. Without that order, moving pointers can skip a valid pair.

Check `[1,1]`, target 2 (the two distinct positions are valid), `[5]` target 10 (no pair), and sorted negatives `[-4,-1,2,8]`, target 4.

<!-- [curated-algorithm-detail:04_two_pointers.md] -->

## 05 stack matching — boundary study

A stack enforces last-opened, first-closed nesting. A closing symbol must match exactly the most recent unmatched opening symbol; simply counting opening and closing symbols cannot distinguish `([)]` from `([])`.

An empty string is balanced. `'}'` is invalid immediately, and `'((('` is invalid at end. The shown parser intentionally ignores ordinary non-bracket characters.

<!-- [curated-algorithm-detail:05_stack_matching.md] -->

## 08 sliding window — boundary study

For a fixed-width window, subtract the element leaving at `right-k` and add the new element at `right`. This preserves the invariant that `current` equals the sum of precisely k consecutive values. It works with negative numbers too.

`k=1` returns the maximum single value, `k=len(values)` returns the whole sum. `k=0` or larger than the input is rejected explicitly.

<!-- [curated-algorithm-detail:08_sliding_window.md] -->
