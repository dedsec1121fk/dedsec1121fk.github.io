# agda — consolidated language guide

## Agda

**Typical use:** Proof assistants and dependent types.

**Suggested file extension:** `.agda`.

**How to run / environment:** Typecheck with agda (not a standalone executable example).

### Starter example

```
module Hello where
open import Agda.Builtin.Nat
answer : Nat
answer = 42
```

### How to read it

This is a minimal typechecking example rather than console I/O.

### Common pitfall

This is a minimal typechecking example rather than console I/O.

## Agda — Expanded practice workbook

### Inspect the smallest source
~~~text
module Hello where
open import Agda.Builtin.Nat
answer : Nat
answer = 42
~~~

**Run or compilation context:** Typecheck with agda (not a standalone executable example).. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Define a length-indexed vector function and write a type that forbids an out-of-bounds index. Check a proof by removing one constructor case.

### Diagnose the sharp edge
A type hole is an unfinished proof, not evidence. Universe levels and termination checking require a specific Agda version.

## Agda — Focused mastery pathway

### Applied exercises

1. State a small proposition and list its assumptions.
2. Reconstruct a short proof using only trusted inference rules.
3. Try removing one assumption and determine whether the proof still works.

- Is the goal an executable value or a checked proposition?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
