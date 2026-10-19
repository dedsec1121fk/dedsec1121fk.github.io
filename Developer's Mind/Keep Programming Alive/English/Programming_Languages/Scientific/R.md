# r — consolidated language guide

## R

### Mental model
R performs vectorized statistical transformations; vector recycling, missing values and data-frame semantics demand explicit checks.

### Minimal source sample
```text
x <- c(2, 4, NA)
mean(x, na.rm = TRUE)
```

### Experiment to carry out
Compare the mean with and without na.rm and explain how missing observations affect denominators.

### A specific failure to distinguish
Automatic vector recycling can yield plausible but wrong results; check lengths and warnings before interpreting statistics.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible R environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## R — Expanded practice workbook

### Inspect the smallest source
~~~text
greet <- function(name) paste0("Hello, ", name, "!")
print(greet("Ada"))
~~~

**Run or compilation context:** Rscript hello.R.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Summarize a data.frame with missing values using mean(x, na.rm=TRUE), group observations by category and test the difference between NA and NaN.

### Diagnose the sharp edge
Factors, character vectors and numeric coercion can change sorting/aggregation silently. Distinguish tibble behavior from base data.frame.

## R — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `Rscript {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## R — Technical notes and common pitfalls

### Core knowledge

1. Vectorization is central, and missing values propagate through many computations.
2. Recycling rules can silently change results; check lengths and dimensions.
3. Factor values represent categorical levels, not merely ordinary character arrays.
