# Python UnboundLocalError: a local is read before assignment

## Reproduce
~~~python
counter = 10
def broken():
    print(counter)
    counter = counter + 1

broken()
~~~

Python decides at compile time that counter is local to broken because it is assigned in that function. The earlier read therefore raises UnboundLocalError even though a global counter exists. The exception is a subclass of NameError, but the name is known to be local and uninitialized.

## Prefer explicit state
~~~python
def increment(counter):
    return counter + 1

assert increment(10) == 11
assert increment(0) == 1
~~~

This pure function has no global mutation and can be reused safely. For closures that intentionally mutate enclosing state, nonlocal can be appropriate; global modifies a module binding and should be a deliberate design choice, not a quick error suppression.

## Diagnose branches and exception paths
An assignment inside an if does not guarantee initialization:

~~~python
def label(flag):
    if flag:
        result = "ready"
    return result
~~~

label(False) raises UnboundLocalError. Initialize result before the branch, return from every branch, or make the missing case explicit. Also check try/except blocks: an assignment in try may be skipped when an exception occurs. Inspect the full function for any assignment, including augmented assignment such as +=, which reads and writes the local.

## Lab
Call label(True) and label(False), then rewrite the function so both cases return a string. Create a closure with nonlocal and compare it to increment. Document whether state should be returned, shared within a closure, or stored in an object. Add tests for every branch rather than relying on a single successful input.

## Minimal branch contract
A function must initialize a variable on *every* path before reading it. In a deliberately failing test, make the assignment conditional on `flag` and call the function with `False`. Compare three valid redesigns: return immediately in each branch, give the variable an explicit default, or raise a descriptive exception on unsupported input. A default is not always correct: for a missing mandatory result, raising is better than silently returning stale state.
