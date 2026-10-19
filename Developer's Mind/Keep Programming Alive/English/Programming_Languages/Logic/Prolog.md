# prolog — consolidated language guide

## Prolog

### Mental model
Prolog expresses relations through facts and rules; execution searches for substitutions satisfying a query.

### Minimal source sample
```text
parent(ada, ben).
parent(ben, cy).
grandparent(X,Y) :- parent(X,Z), parent(Z,Y).
```

### Experiment to carry out
Ask grandparent(ada,Who) and derive cy by hand; then query a nonexistent relationship and compare logical failure with an exception.

### A specific failure to distinguish
Order of clauses and recursion can affect termination in depth-first Prolog implementations even when relations are logically sound.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Prolog environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Prolog — Expanded practice workbook

### Inspect the smallest source
~~~text
greet(Name) :- format('Hello, ~w!~n', [Name]).
main :- greet('Ada').
~~~

**Run or compilation context:** swipl -q -s hello.pl -g main -t halt.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Define parent/2 facts and grandparent/2 with unification. Query multiple solutions; then add a recursive ancestor rule and test termination on a cycle.

### Diagnose the sharp edge
Clause order and depth-first search can cause infinite recursion; accidental unification with = instead of comparison alters results.
