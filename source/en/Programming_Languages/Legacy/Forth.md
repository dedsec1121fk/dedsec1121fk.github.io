# forth — consolidated language guide

## Forth

### How the language behaves
Forth evaluates words on an explicit data stack; the code's stack effect is often more informative than its variable names.

### Source fragment to analyze
```text
3 4 + .
```

### Deliberate exercise
Write the stack state after each token and explain why the print word consumes the result. Define a new square word using dup and *.

### Check a failure condition
A stack underflow is not a harmless arithmetic exception; document expected stack depth before combining words.

Record input, expected output and observed output with the actual Forth implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Forth — Expanded practice workbook

### Inspect the smallest source
~~~text
: greet  ." Hello, Ada!" cr ;
greet
~~~

**Run or compilation context:** gforth hello.fs.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Write stack-effect comments for a word calculating squared sum of two numbers. Trace DUP, SWAP and arithmetic, then test for stack underflow.

### Diagnose the sharp edge
Unlike conventional argument passing, Forth words consume stack cells implicitly. Return-stack misuse and data-stack imbalance can corrupt later execution.

## Forth — Focused mastery pathway

### Mechanism
Forth operates on a data stack rather than naming each intermediate value. A comment of the form ( a b -- result ) documents what a word consumes and produces; it is not automatic runtime type checking. The rightmost item in the comment represents the top of stack.

### Small Gforth exercise
~~~forth
: squared ( n -- n-squared ) dup * ;
: sum-of-squares ( a b -- result ) squared swap squared + ;
3 4 sum-of-squares .
~~~
Expected display: 25. Trace the stack: (3 4) becomes (3 16) after squared; swap makes (16 3); squared makes (16 9); + leaves (25). By comparison, 3 4 + dup * produces 49 because it squares the sum instead of summing squares.

### Independent and failing experiments
1. Run 3 squared and -3 squared, then print results. Both should produce 9 for in-range signed cells.
2. Remove one argument before sum-of-squares in a disposable REPL and capture the stack-underflow diagnostic.
3. Ask what 0 squared does and test it. Distinguish empty stack from the legitimate integer zero.
4. Multiply very large integers and record cell-width overflow instead of assuming arbitrary precision.
5. Write a new word mean2 using + 2 / and test odd sums. Define whether integer truncation is acceptable.
6. For an interactive calculator, accept only known words and values. Do not evaluate untrusted text from files or a website.

### Evidence and constraints
Save the precise Gforth version, console input/output, one failed run and the stack trace at each step. A correct effect comment is useful review evidence but does not substitute for execution. Official manual: https://gforth.org/manual/Stack_002dEffect-Comments-Tutorial.html
