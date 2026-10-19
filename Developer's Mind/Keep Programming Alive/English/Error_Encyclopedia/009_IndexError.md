# IndexError: guard boundaries without masking bugs

## What fails and when
IndexError is a sequence access outside its valid range. The usual non-negative positions are 0 through len(items)-1; negative indices count from the end but still fail on empty sequences. Index errors are frequently caused by mismatched loop bounds, unsafe assumptions about split() or stale indexes after removal.

## Self-contained executable example
Save this as 009_IndexError.py and run `python3 009_IndexError.py`. The example checks both the error and a valid case.

~~~python
def first_and_last(values):
    if not values:
        return None
    return values[0], values[-1]
assert first_and_last([]) is None
assert first_and_last([8]) == (8, 8)
assert first_and_last([8, 9]) == (8, 9)
try:
    [][0]
except IndexError:
    pass
else:
    raise AssertionError("empty list indexed")
~~~

## Diagnostic sequence and safe repair
Inspect len(sequence) and the requested index at the failing expression, then trace who constructed or shortened the sequence. Prefer for value in values when positions are unnecessary and enumerate(values) when they are. Catch IndexError only if an absent element is an expected case; otherwise fix the producer or boundary check.

## Practical lab and boundary test
Write a safe nth(values, index) function supporting documented negative indices. Decide whether an out-of-range request returns None or raises; test empty, singleton, len(values) and -len(values)-1.

## A safe positional lookup that preserves None
Returning None for a missing element is ambiguous if None is a legitimate list value. Accept a caller-owned sentinel instead, and specify whether negative positions are supported. Reject Boolean indices explicitly: Python otherwise treats True as integer 1.

~~~python
def nth_or(values, index, default):
    if type(index) is not int:
        raise TypeError('index must be int, not bool')
    if -len(values) <= index < len(values):
        return values[index]
    return default

missing = object()
assert nth_or([None, 'b'], 0, missing) is None
assert nth_or([None, 'b'], -1, missing) == 'b'
assert nth_or([], 0, missing) is missing
assert nth_or([3], -2, missing) is missing
try: nth_or([1], True, missing)
except TypeError: pass
else: raise AssertionError('bool index accepted')
~~~

## Trace the faulty boundary
For a list of length n, valid negative indices start at -n; the index -n-1 is invalid. Before changing a guard, inspect the producer: did a filter remove elements, did split() return fewer fields, or did a concurrent mutation invalidate the stored position? The mastery task is to explain all five assertions, then add a tuple case and a failing out-of-range positive index without catching an unrelated IndexError.
