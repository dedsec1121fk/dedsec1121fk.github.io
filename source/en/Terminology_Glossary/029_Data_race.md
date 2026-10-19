# Glossary: data races, deadlocks and debugging

## Data race

### Concept in practice
A data race occurs when concurrent execution accesses the same mutable location without appropriate synchronization and at least one access writes it. In languages with weakly defined or undefined racy semantics this may invalidate assumptions; in Python thread scheduling still makes multi-step updates non-atomic.

### Focused example
~~~python
from threading import Lock
value = 0
lock = Lock()
def safe_increment():
    global value
    with lock: value += 1
~~~

### Exercise and common pitfall
Run many safe increments on a shared counter and assert the final count. Then explain why replacing the lock with a `sleep` call would not enforce correctness. For immutable message passing, compare the benefits and overhead with mutex-based shared state.

**Reference:** https://docs.python.org/3/library/threading.html#lock-objects

## Deadlock

### Concept in practice
Deadlock means participants wait on resources in a cycle such that none can make progress. Two threads taking locks in opposite orders are a classic example. A slow task or high CPU use alone does not prove deadlock; identify the wait-for cycle before diagnosing it.

### Focused example
~~~python
from threading import Lock
first, second = Lock(), Lock()
def do_work():
    with first:
        with second:
            return 'ok'
assert do_work() == 'ok'
~~~

### Exercise and common pitfall
Document a global lock acquisition order for every path needing both locks. In a diagram, show the unsafe opposite-order sequence without actually running code that intentionally hangs. Explore bounded lock acquisition timeouts and graceful failure.

**Reference:** https://docs.python.org/3/library/threading.html#lock-objects

## Debugging

### Concept in practice
Debugging is the process of finding the mechanism that causes observed behavior to differ from a specification. It is not the same as randomly changing lines until a symptom disappears. A minimal reproducer, expected-versus-actual comparison and a regression test make the diagnosis falsifiable.

### Focused example
~~~python
def average(values):
    if not values: return None
    return sum(values) / len(values)
assert average([]) is None
assert average([2, 4]) == 3
~~~

### Exercise and common pitfall
Create a failing version that divides by zero for an empty list. State the invariant 'do not divide when the count is zero' and add a regression test before repairing it. For a UI bug, also record browser version and reproduction actions.

**Reference:** https://docs.python.org/3/library/pdb.html

## Dependency

### Concept in practice
A dependency is another component needed to build, run or test your software. Direct dependencies are declared explicitly; transitive dependencies are pulled in by those components. Version ranges, lockfiles and platform compatibility affect whether repeated installs yield the same behavior.

### Focused example
~~~sh
python -m pip --version
python -m pip list --format=freeze
# inspect the local environment; these commands install nothing
~~~

### Exercise and common pitfall
Compare a pinned and unpinned requirements file in a disposable virtual environment. Record direct packages separately from the full resolved graph. Avoid installing a package merely because its name resembles an error; verify publisher and official documentation.

**Reference:** https://packaging.python.org/en/latest/discussions/install-requires-vs-requirements/
