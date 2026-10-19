# picolisp — consolidated language guide

## PicoLisp

### Mental model
PicoLisp is a compact Lisp system emphasizing symbols, lists and interpreted applications including database-oriented tooling.

### Minimal source sample
```text
(println (+ 3 4))
```

### Experiment to carry out
Inspect atom and list evaluation using the installed PicoLisp interpreter; compare a quoted list with an evaluated expression.

### A specific failure to distinguish
PicoLisp's symbols, dynamic binding and database mechanisms should not be assumed identical to Common Lisp.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible PicoLisp environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## PicoLisp — Expanded practice workbook

### Read the baseline source
~~~text
(prinl "Hello, Ada!")
~~~

**Relevant environment:** pil hello.l (implementation-dependent).. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Use a small association list for named counts and inspect symbol/value evaluation. Compare a quoted list with an evaluated form in the target PicoLisp REPL.

### The failure that must be understood
PicoLisp is not Common Lisp: namespaces, builtins and evaluation details differ. Consult PicoLisp's reference for symbol binding behavior.

## PicoLisp — Focused mastery pathway

### Inspect the language's real model
Use cons, car and cdr to construct and inspect a list. Compare a quoted list with an evaluated function application in a PicoLisp REPL.

### Controlled failure and recovery
Create an association list mapping item names to nonnegative stock counts; test a missing item and duplicate key before computing totals.

### Independent practical assignment
Write a small inventory query in native PicoLisp, documenting symbol binding and persistence semantics of the chosen version. Avoid treating it as Common Lisp code.
