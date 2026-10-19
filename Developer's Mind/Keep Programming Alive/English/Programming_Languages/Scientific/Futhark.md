# futhark — consolidated language guide

## Futhark

### Mental model
Futhark is a purely functional array language designed for efficient parallel execution on CPUs and GPUs.

### Minimal source sample
```text
def square (x: i32) : i32 = x * x
```

### Experiment to carry out
Trace input/output typing and then describe a parallel map over an array, distinguishing pure transformations from side effects.

### A specific failure to distinguish
Changing input shape can change memory costs and device constraints even with identical element-wise arithmetic.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Futhark environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Futhark — Expanded practice workbook

### Inspect the smallest source
~~~text
def double (x: i32) : i32 = x * 2
~~~

**Run or compilation context:** futhark check hello.fut.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Map a pure arithmetic function over an array, reduce to a scalar, and compare expected results with sequential reference values. Record transfer versus compute time.

### Diagnose the sharp edge
Futhark is designed for data-parallel arrays and disallows arbitrary host-side effects inside kernels. GPU overhead can dominate tiny inputs.
