# Loops — reason about the stopping condition

## Concept and intended result
A loop repeats an operation. This exercise sums every even number from zero through an inclusive upper limit, using a while loop rather than a built-in sum. The stopping condition is `current <= limit`, and each iteration adds two to current. To show termination, identify a measure that moves monotonically toward the boundary and cannot cycle forever within the allowed range.

## Runnable Python 3 exercise
Save as `04_Loops.py` and run with Python 3. Predict the output before executing; every example has assertions and uses only local synthetic values.

~~~python
def even_sum(limit):
    if type(limit) is not int or not 0 <= limit <= 1000:
        raise ValueError("limit out of bounds")
    total = 0
    current = 0
    while current <= limit:
        total += current
        current += 2
    return total
assert even_sum(0) == 0
assert even_sum(6) == 12
assert even_sum(7) == 12
assert even_sum(10) == sum(n for n in range(11) if n%2==0)
try: even_sum(-1)
except ValueError: pass
else: raise AssertionError("invalid limit accepted")
print("PASS terminating while loop")
~~~

## Why this works
With a nonnegative upper bound at most 1000, current begins at zero and increases by two. Eventually it becomes greater than limit, so the condition becomes false. The accumulated total remains the sum of even values already visited; this is the loop invariant. A for loop with range(0, limit+1, 2) would express the same task more compactly, but the explicit while version helps inspect updates and off-by-one mistakes.

## Guided learner lab
Trace current and total for limit 6 on paper, row by row. Change `<=` to `<` and show the boundary at which the result changes. Remove `current += 2` only in a disposable test and explain the infinite-loop risk without running it. Rewrite with a for loop and compare results for every limit from zero through 100.

## Diagnosing mistakes
If execution never ends, inspect whether the loop variable changes toward the stop condition. If the final value is missing, check the inclusive versus exclusive comparison. Do not run intentionally unbounded loops on a shared or battery-limited phone; reason about them from a finite trace.
