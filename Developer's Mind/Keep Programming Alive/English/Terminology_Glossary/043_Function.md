# Glossary: functions, garbage collection and generics

## Function

### Meaning and constraints
A function packages a repeatable computation behind inputs and a return value. A good contract identifies accepted types, invalid inputs, side effects and guarantees. Calling a function does not imply it is pure: it may modify files, global state or a database.

### A concrete use
~~~python
def area(width: float, height: float) -> float:
    if width < 0 or height < 0: raise ValueError('negative dimension')
    return width * height
assert area(3, 4) == 12
assert area(0, 5) == 0
~~~

### Challenge and misconception
Add tests for a negative dimension and a nonnumeric input. Decide whether a function annotated with float should validate runtime types at an external boundary; annotations alone do not enforce conversion.

**Further reading:** https://docs.python.org/3/tutorial/controlflow.html#defining-functions

## Garbage collection

### Meaning and constraints
Garbage collection reclaims memory for unreachable objects according to runtime rules. Python primarily uses reference counting with a cyclic collector, while other runtimes may use tracing collectors. Collection frees memory resources, but does not guarantee prompt release of file handles or locks.

### A concrete use
~~~python
from contextlib import closing
from io import StringIO
with closing(StringIO('test')) as stream:
    assert stream.read() == 'test'
assert stream.closed
~~~

### Challenge and misconception
Explain why an explicit context manager is preferable for file handles. Sketch a two-object reference cycle and note that memory collection timing is not a portable API contract.

**Further reading:** https://docs.python.org/3/library/gc.html

## Generic type

### Meaning and constraints
A generic type is parameterized by another type so one abstraction can preserve information about several concrete kinds of data. In Python, `list[int]` communicates element expectations to type checkers, but does not reject wrong elements at runtime by itself.

### A concrete use
~~~python
from typing import TypeVar
T = TypeVar('T')
def first(items: list[T]) -> T | None:
    return items[0] if items else None
assert first([3,4]) == 3
assert first([]) is None
~~~

### Challenge and misconception
Ask a type checker to infer the return type for list[str] and list[int]. Compare the compile-time checking with a runtime validator that must still inspect unknown JSON elements.

**Further reading:** https://docs.python.org/3/library/typing.html

## Git

### Meaning and constraints
Git is a distributed version-control system: a local clone usually has commits, branches and metadata independently of the remote server. `fetch` updates knowledge of remote refs, `merge` or `rebase` reconciles histories, and `push` publishes local commits if permitted.

### A concrete use
~~~sh
git status --short --branch
git log --oneline -5
git remote -v
git fetch origin
~~~

### Challenge and misconception
Use a disposable clone to compare `git status` before and after `fetch`. Confirm that fetch alone does not alter tracked working files. Do not force-push or reset production branches to compensate for confusion.

**Further reading:** https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F

## Hash function

### Meaning and constraints
A hash function deterministically maps input bytes to a fixed-size digest. Cryptographic SHA-256 aims to make accidental and deliberate collision construction impractical, but a digest only checks equality relative to a trusted known value. A dictionary's internal hash has different security goals.

### A concrete use
~~~python
import hashlib
h = lambda b: hashlib.sha256(b).hexdigest()
assert h(b'abc') == 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
assert h(b'abc') != h(b'abd')
~~~

### Challenge and misconception
Hash a file before and after changing one byte; record both digests. Explain why publishing a malicious binary and its matching digest on the same compromised page offers no identity guarantee.

**Further reading:** https://docs.python.org/3/library/hashlib.html
