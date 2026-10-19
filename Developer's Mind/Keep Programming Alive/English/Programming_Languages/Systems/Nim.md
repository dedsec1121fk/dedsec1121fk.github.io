# nim — consolidated language guide

## Nim

### Mental model
Nim compiles typed code through native backends and uses indentation and distinct value/reference type concepts.

### Minimal source sample
```text
let nums = @[1, 2, 3]
echo nums.len
```

### Experiment to carry out
Measure sequence length, then compare immutable let binding with a mutable var sequence.

### A specific failure to distinguish
Ownership and memory-management options depend on compiler version and mode; pin settings when comparing behavior.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Nim environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Nim — Expanded practice workbook

### Read the baseline source
~~~text
proc greet(name: string): string =
  "Hello, " & name & "!"
echo greet("Ada")
~~~

**Relevant environment:** nim c -r hello.nim.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Define a typed sequence, parse an Option[int] and use a proc with an explicit result type. Compare value semantics and ref object sharing.

### The failure that must be understood
Nim backends and memory-management modes differ; C compilation errors may come from the generated backend, not Nim source.

## Nim — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `nim c -r {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.
