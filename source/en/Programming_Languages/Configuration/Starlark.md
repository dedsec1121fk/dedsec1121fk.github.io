# starlark — consolidated language guide

## Starlark

### Operational idea
Starlark is a restricted Python-like configuration language used in build systems, emphasizing deterministic evaluation.

### Source or deliberately marked concept
```text
def inc(x):
    return x + 1
```

### Apply it to one controlled task
Use an authorized build sandbox to evaluate the function and explain why unrestricted Python imports are not available.

### Check the important boundary
Python syntax resemblance does not imply full standard-library access or mutable behavior identical to CPython.

Work with disposable data in a genuine implementation of Starlark where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Starlark — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Starlark. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
def greet(name):
    return "Hello, " + name + "!"

result = greet("Ada")
~~~

**Run context:** Evaluate in a Starlark/Bazel-capable host.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Implement a pure function that generates build labels from a list. In Bazel, load the .bzl implementation explicitly and check which attributes are legal in BUILD files.

### Boundary-case investigation
Starlark intentionally restricts Python features and host-specific globals; check evaluator phase errors separately from compiler errors.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Starlark. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.
