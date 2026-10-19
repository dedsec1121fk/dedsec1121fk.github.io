# uiua — consolidated language guide

## Uiua

### Mental model
Uiua is an array-oriented stack language with symbolic operations, where data shape and stack effects guide code reading.

### Minimal source sample
```text
# Conceptual lab: reduce a small numeric vector by addition
```

### Experiment to carry out
Begin with a verified Uiua interpreter example from its own documentation; draw the stack after each executed token.

### A specific failure to distinguish
Do not paste APL or J symbols assuming identical execution; the snippet above is a task description, not runnable Uiua syntax.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Uiua environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Uiua — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Uiua. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
"Hello, Ada!"
~~~

**Run context:** uiua run hello.ua (version dependent).. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Start with an array literal, consult the current primitive reference, then draw the stack before/after one monadic and one dyadic array operation; verify each transformation in the REPL.

### Boundary-case investigation
Printed values and glyph spellings may differ by Uiua release; check the CLI version instead of copying old APL examples.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Uiua. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.
