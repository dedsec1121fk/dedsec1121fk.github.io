# mercury — consolidated language guide

## Mercury

**Typical use:** Logic programming.

**Suggested file extension:** `.m`.

**How to run / environment:** mmc --make hello (Mercury toolchain).

### Starter example

```
:- module hello.
:- interface.
:- import_module io.
:- pred main(io::di, io::uo) is det.
:- implementation.
main(!IO) :- io.write_string("Hello, Ada!\n", !IO).
```

### How to read it

Logic language with strict type and mode declarations.

### Common pitfall

Logic language with strict type and mode declarations.

## Mercury — Expanded practice workbook

### Inspect the smallest source
~~~text
:- module hello.
:- interface.
:- import_module io.
:- pred main(io::di, io::uo) is det.
:- implementation.
main(!IO) :- io.write_string("Hello, Ada!\n", !IO).
~~~

**Run or compilation context:** mmc --make hello (Mercury toolchain).. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Create a deterministic predicate and a multi-solution predicate over a small relation. Declare modes and determinism, and let the compiler reject a mismatched declaration.

### Diagnose the sharp edge
Mercury treats determinism and instantiation states as part of its interface; Prolog syntax is similar but not freely interchangeable.

## Mercury — Focused mastery pathway

### Applied exercises

1. Describe a tiny parent/ancestor relation and query it in the proper language host.
2. Show how an additional fact changes the result set.
3. Explain termination or search-order effects of a recursive rule.

- Does execution search for solutions or execute steps in order?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
