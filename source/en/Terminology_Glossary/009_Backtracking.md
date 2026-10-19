# Glossary: backtracking and search complexity

## Backtracking

### How this concept behaves
Search that explores a candidate, rejects it when constraints fail, then restores state to try another path. Useful for Sudoku and permutations but may need pruning to avoid exponential search.

### Work through a small example
~~~text
def choices(xs):
    if not xs: yield []
    else:
        for i,x in enumerate(xs):
            for tail in choices(xs[:i]+xs[i+1:]): yield [x]+tail
assert len(list(choices([1,2,3])))==6
~~~

### Investigate the behavior
Add an early constraint forbidding a particular prefix and measure how many branches are pruned.

## Big O

### How this concept behaves
Asymptotic upper bound describing growth with input size, not exact wall-clock seconds. O(n log n) can still be slower than O(n²) for tiny inputs because constants matter.

### Work through a small example
~~~text
def contains(items,x):
    return x in items
assert contains([1,2,3],2)
~~~

### Investigate the behavior
Measure membership lookup across increasing list lengths, then compare with a set built beforehand and include the set-construction cost.

### Explain a boundary case
For Big O notation, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Binary search — glossary definition

### How this concept behaves
Search in sorted data by halving the candidate interval each iteration. With N elements there are O(log N) comparisons; an unsorted list violates the precondition.

### Work through a small example
~~~text
def find(a,x):
    lo,hi=0,len(a)
    while lo<hi:
        m=(lo+hi)//2
        if a[m]<x: lo=m+1
        else: hi=m
    return lo if lo<len(a) and a[lo]==x else None
assert find([1,3,5],3)==1
~~~

### Investigate the behavior
Trace lo/hi/m for a missing number, then test duplicates and empty arrays against bisect_left.

## Bit

### How this concept behaves
Smallest binary information unit with values 0 and 1. Bit masks encode flags; confusing signed bit interpretation with mathematical integers can change results.

### Work through a small example
~~~text
READ=1;WRITE=2;EXEC=4
permissions=READ|WRITE
assert permissions&READ
assert not permissions&EXEC
~~~

### Investigate the behavior
Add EXEC to the mask and remove WRITE. Predict results of &, | and ~ before executing each bitwise operation.

### Explain a boundary case
For Bit, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Boolean

### How this concept behaves
Logical true/false value used for conditions. Python bool is a subclass of int, so isinstance(True,int) is true; strict numeric validation may require type(x) is int.

### Work through a small example
~~~text
assert (2<3) is True
assert isinstance(True,int)
assert type(True) is bool
~~~

### Investigate the behavior
Design a JSON schema check where max_items=True must be rejected even though bool behaves numerically as 1.

### Explain a boundary case
For Boolean, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.
