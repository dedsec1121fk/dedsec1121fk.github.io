# nix — consolidated language guide

## Nix

### Mental model
Nix is a language for evaluating immutable expressions used in reproducible packaging and system configuration.

### Minimal source sample
```text
let numbers = [ 1 2 3 ]; in builtins.length numbers
```

### Experiment to carry out
Evaluate the list length and replace one item with a string to see whether list length requires homogeneous elements.

### A specific failure to distinguish
A Nix expression evaluating successfully does not mean its referenced derivation built successfully or fetched dependencies offline.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Nix environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Nix — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Nix. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
let name = "Ada"; in "Hello, ${name}!"
~~~

**Run context:** nix eval --file hello.nix.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Evaluate a let/in expression and an attribute-set override using //. Distinguish expression evaluation from a derivation build, then compare locked and unlocked dependency inputs.

### Boundary-case investigation
Nix's laziness can defer errors until a value is forced. Do not run nixos-rebuild or mutate system profiles for this evaluation exercise.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Nix. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.

## Nix — Technical notes and common pitfalls

### Core knowledge

1. Nix expressions are declarative and largely functional, used in the Nix package ecosystem.
2. Reproducibility depends on declared inputs and pinned sources, not on assumptions about the host.
3. Understand evaluation versus realization/building of derivations.
