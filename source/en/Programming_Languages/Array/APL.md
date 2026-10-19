# apl — consolidated language guide

## APL

### How the language behaves
APL operates naturally over arrays and uses symbolic operators with rank and shape semantics.

### Source fragment to analyze
```text
+/ 1 2 3 4
```

### Deliberate exercise
Calculate reduction on a simple vector and inspect how the chosen interpreter represents multidimensional shape.

### Check a failure condition
Do not assume a scalar reduction over one axis applies identically to every rank; document the array's shape.

Record input, expected output and observed output with the actual APL implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## APL — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for APL. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
⎕←'Hello, Ada!'
~~~

**Run context:** Load in an APL interpreter (dialect dependent).. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Reduce a matrix along each axis and annotate rank and shape after every operator; a scalar total and a one-element vector are not interchangeable.

### Boundary-case investigation
A mismatched shape or missing APL glyph changes the experiment; verify workspace encoding and interpreter dialect first.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to APL. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.

## APL — Focused mastery pathway

### Applied exercises

1. Transform a numeric vector, inspect shape, then verify a reduction against hand-calculated values.
2. Compare scalar and array operations with a small input; identify broadcasting rules if supported.
3. Measure the cost of an intermediate array and check whether an in-place operation is allowed.

- What is the rank/shape of the value?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
