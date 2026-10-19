# wolfram_language — consolidated language guide

## Wolfram Language

### Operational idea
The Wolfram Language mixes symbolic expressions with numerical computation and pattern-based transformations.

### Source or deliberately marked concept
```text
Factor[x^2 - 1]
```

### Apply it to one controlled task
Compare symbolic factorization with evaluating a numerical value for x. Explain what remains symbolic.

### Check the important boundary
A symbolic identity does not imply that floating-point approximation has no rounding error.

Work with disposable data in a genuine implementation of Wolfram_Language where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Wolfram_Language — Expanded practice workbook

### Inspect the smallest source
~~~text
greet[name_] := "Hello, " <> name <> "!";
Print[greet["Ada"]];
~~~

**Run or compilation context:** wolframscript -file hello.wl.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Apply Map and Total to a list of numeric values, inspect symbolic expressions with FullForm, and contrast exact rational results with machine precision.

### Diagnose the sharp edge
Delayed definitions := and immediate = have different evaluation semantics; pattern matching can bind unexpectedly if underscored names are reused.
