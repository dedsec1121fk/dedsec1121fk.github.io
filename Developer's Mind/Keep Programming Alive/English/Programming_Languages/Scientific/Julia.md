# julia — consolidated language guide

## Julia

### Mental model
Julia specializes in numerical and scientific computing with multiple dispatch and a just-in-time compiler.

### Minimal source sample
```text
squares = [x^2 for x in 1:4]
println(sum(squares))
```

### Experiment to carry out
Compute 1+4+9+16 and contrast broadcasting with ordinary matrix multiplication in a second experiment.

### A specific failure to distinguish
Compilation latency and runtime performance are different metrics; time repeated calls after warm-up when benchmarking.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Julia environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Julia — Expanded practice workbook

### Inspect the smallest source
~~~text
greet(name) = "Hello, $(name)!"
println(greet("Ada"))
~~~

**Run or compilation context:** julia hello.jl.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Implement a sum over a vector with a typed function, inspect allocations with @allocated and compare broadcasting f.(x) to a loop. Test zero-length and mixed-type input.

### Diagnose the sharp edge
Julia indices are commonly 1-based; global-variable performance and first-call compilation influence naive benchmarks.

## Julia — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `julia {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Julia — Technical notes and common pitfalls

### Core knowledge

1. Julia specializes methods by argument types and supports multiple dispatch.
2. Array indices normally begin at 1; vectorized operations use broadcasting syntax.
3. A fast implementation may still require profiling for allocations and type stability.
