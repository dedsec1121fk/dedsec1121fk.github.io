# Glossary: optionals, overflow and package managers

## Optional

### Precise meaning
An API that represents present and absent results as distinct cases. Rust Option<T>, TypeScript optional properties and Python's T|None annotation describe related concepts but have different runtime behavior.

### Reference experiment
~~~text
def first(items: list[int]) -> int | None:
    return items[0] if items else None
assert first([]) is None
assert first([0])==0
~~~

### Investigate the boundary
Replace None with an explicit found/missing tagged result and compare caller behavior when the valid result is zero.

### Zero is a value, not a missing argument
Represent absent data explicitly. Using a truthiness test merges zero with None and may create subtle application errors.

~~~python
def remaining(capacity, limit=None):
    if capacity < 0 or (limit is not None and limit < 0):
        raise ValueError("negative")
    return capacity if limit is None else min(capacity, limit)
assert remaining(7) == 7
assert remaining(7, 0) == 0
assert remaining(7, 3) == 3
~~~

Deliberately replace the None test with a falsy-value test and reproduce the zero-limit bug. A tagged Result is more expressive if missing, invalid and present are distinct outcomes. Static Optional annotations do not validate untrusted JSON at runtime.

## Overflow

### Precise meaning
Numeric result outside a fixed type's range. Languages can trap, wrap or reject overflow. Python's arbitrary-precision integers are different from unsigned 8-bit registers.

### Reference experiment
~~~text
def add_u8(a,b):
    if not (0<=a<=255 and 0<=b<=255): raise ValueError()
    if a > 255-b: raise OverflowError()
    return a+b
assert add_u8(255,0)==255
~~~

### Investigate the boundary
Try add_u8(250,6) and compare its error with an intentionally wrapping 8-bit counter. Explain why overflow is dangerous in money calculations.

### Check fixed-width limits before serializing
Python integers are arbitrary precision, but a binary unsigned byte has a maximum of 255. Validation must respect the destination type.

~~~python
def add_u8(a, b):
    if any(type(v) is not int or not 0 <= v <= 255 for v in (a,b)):
        raise ValueError("unsigned byte expected")
    if a > 255-b:
        raise OverflowError("byte overflow")
    return a+b
assert add_u8(200, 55) == 255
try:
    add_u8(200, 56)
except OverflowError: pass
else: raise AssertionError("invalid result accepted")
~~~

Contrast rejection with wrapping modulo 256. Wrapping may be correct for some protocols but dangerous for sizes and financial balances. C signed integer overflow is undefined behavior rather than guaranteed wraparound.

## Package manager

### Precise meaning
A dependency resolver and installer whose trust boundary includes registries, lockfiles, version constraints, installation hooks and platform compatibility.

### Reference experiment
~~~text
python -m pip --version
python -m pip list --format=columns
~~~

### Investigate the boundary
In a disposable virtual environment install a trusted pinned package, inspect its exact resolved version and compare to an unpinned requirement.

### Independent check
For Package manager, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.
