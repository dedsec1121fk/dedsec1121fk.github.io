# bqn — consolidated language guide

## BQN

### How the language behaves
BQN is an array language with explicit notation for operations over ranks and cells, designed to make array transformations concise.

### Source fragment to analyze
```text
1 + 2
```

### Deliberate exercise
After confirming scalar addition, compare an element-wise array operation with a shape-changing operation in a compatible BQN interpreter.

### Check a failure condition
APL symbols and BQN symbols are not interchangeable despite shared array-language heritage; consult BQN-specific documentation.

Record input, expected output and observed output with the actual BQN implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## BQN — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for BQN. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
•Show "Hello, Ada!"
~~~

**Run context:** bqn hello.bqn (interpreter dependent).. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Compare •Show on a scalar and on an array, then use a BQN reduction primitive from the official glyph chart; write down the stack/argument order and resulting array shape.

### Boundary-case investigation
Do not assume APL glyph names transfer to BQN: the syntax and argument conventions are distinct.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to BQN. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.
