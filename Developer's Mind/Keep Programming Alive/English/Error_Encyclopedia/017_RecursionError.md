# Python RecursionError — termination comes before limit increases

## Trigger
Each recursive call requires another frame. When a base case is missing or does not make progress, Python eventually raises RecursionError. Raising sys.setrecursionlimit to a huge number can crash the process and is not a logical repair.

~~~python
def bad_count(n):
    return 1 + bad_count(n)  # n never changes; do not call this in ordinary tests
~~~

## Correct with a decreasing measure
A recursive function needs a well-founded measure that strictly decreases and a base case covering the minimum.

~~~python
def count_down(n: int) -> int:
    if n < 0:
        raise ValueError("nonnegative input required")
    if n == 0:
        return 0
    return 1 + count_down(n-1)

assert count_down(4) == 4
assert count_down(0) == 0
~~~

## Choose iteration when depth is unbounded
For a large input, rewrite with a loop rather than trying to tune the interpreter's recursion depth:

~~~python
def iterative_count(n: int) -> int:
    if n < 0: raise ValueError("negative")
    result = 0
    while n:
        result += 1
        n -= 1
    return result

assert iterative_count(20000) == 20000
~~~

**Exercise:** draw the call stack for count_down(3), identify the invariant and check an invalid negative input. Reference: https://docs.python.org/3/library/exceptions.html#RecursionError

## Distinguish a cycle from deep valid input
In recursive tree traversal, a cycle can cause infinite revisits even if the tree would otherwise be shallow. A simple stack-based traversal avoids relying on the process recursion limit but still needs a visited set when the structure is actually a graph. Test a linear chain, a self-cycle and a wide shallow graph. Increasing `sys.setrecursionlimit` does not fix cycles, and setting it excessively high risks a native stack crash. Benchmark memory usage of an explicit stack separately from stack frames.
