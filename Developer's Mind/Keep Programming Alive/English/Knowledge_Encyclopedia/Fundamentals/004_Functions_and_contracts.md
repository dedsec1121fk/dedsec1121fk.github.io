# Functions, invariants, recursion and error boundaries

## Functions and contracts

### Design principle and reasoning
A function contract specifies accepted inputs, outputs, errors and side effects. Type hints alone do not enforce numeric ranges or filesystem permissions; runtime checks are necessary for untrusted inputs.

### Study a concrete case
~~~python
def percent(part,total):
    if total<=0 or not 0<=part<=total: raise ValueError('range')
    return 100*part/total
assert percent(2,4)==50
~~~

### Independent exercise
Test zero total and part>total and prove the caller observes clear exceptions. Decide if fractional inputs are allowed.

### Evidence for review
For Functions and contracts, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Iteration and invariants

### Design principle and reasoning
A loop invariant is true before every iteration and remains true afterward. In an accumulator loop, total equals the sum of elements already processed; termination requires measurable progress.

### Study a concrete case
~~~python
def total(xs):
    s=0
    for x in xs:s+=x
    return s
assert total([2,3,4])==9
~~~

### Independent exercise
Instrument iterations and assert that the running sum matches a prefix. Test empty input and negative elements.

### Evidence for review
For Iteration and invariants, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Recursion and termination

### Design principle and reasoning
Every recursive call must reduce a well-founded measure until a base case applies. An argument that never changes causes unbounded recursion, and increasing the interpreter stack limit does not correct logic.

### Study a concrete case
~~~python
def depth(n):
    if n<0: raise ValueError()
    if n==0:return 0
    return 1+depth(n-1)
assert depth(4)==4
~~~

### Independent exercise
Trace the call stack for n=3. Compare iterative implementation at n=20000 and explain recursion depth limits.

### Evidence for review
For Recursion and termination, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Error handling boundaries

### Design principle and reasoning
Errors should be handled where a component can make a meaningful decision: a parser reports invalid data, while the CLI chooses whether to show a message or exit. Catching Exception around everything can hide defects.

### Study a concrete case
~~~python
def parse_port(s):
    n=int(s)
    if not 1<=n<=65535:raise ValueError('port')
    return n
assert parse_port('443')==443
~~~

### Independent exercise
Distinguish integer conversion failure, out-of-range values and missing files. Only translate errors at a boundary where you can add useful context.

### Evidence for review
For Error handling boundaries, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.
