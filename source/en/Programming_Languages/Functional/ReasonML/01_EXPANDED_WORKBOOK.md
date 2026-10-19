# ReasonML — exhaustively match optional data

## Distinguish Reason from modern ReScript

Reason syntax belongs to an OCaml-oriented ecosystem; examples from a modern ReScript project may differ. In a matching Reason toolchain, consider:

~~~reason
let label = option =>
  switch (option) {
  | Some(value) => "value: " ++ value
  | None => "missing"
  };
let a = label(Some("Ada"));
let b = label(None);
~~~

The first result is expected to be "value: Ada" and the second "missing". The match handles both constructors of option. The exact source syntax and string concatenation operator must be validated against your chosen compiler version before adoption.

## Boundary case, not a missing case

Try Some(""). Although the string is empty, the constructor is Some and the value exists. Removing the None branch makes the function non-exhaustive; capture compiler warnings or errors rather than assuming an unchecked runtime default.

## Independent exercise

Build a parser returning option for a user-supplied nonempty label and a caller that handles None. Include an empty string, whitespace and a Unicode name in tests. Record whether you are using Reason/OCaml or ReScript, command line and observed output. No compiler run is claimed here.

## Choose the matching toolchain before copying code
A file ending .re should be compiled with the specific Reason syntax integration installed in the OCaml build. Modern ReScript projects typically use .res files and should not be assumed to accept the same snippet. Write down compiler version and extension first, then compile the smallest function before adding a UI or database. Model a user lookup as an option and show that None differs from Some(""), even when both would display an empty label under a careless formatting rule. Test a nested option input and explain why flattening it may discard meaningful states; do not replace every None with a fabricated name.

## ReasonML

### Mental model
ReasonML provided an alternative syntax around OCaml and strongly typed functional programming; modern projects may use ReScript instead.

### Minimal source sample
```text
/* Conceptual typed function */
let double = x => x * 2;
```

### Experiment to carry out
Identify which compiler and package ecosystem a repository actually uses before running its source; compare Reason syntax with current ReScript syntax.

### A specific failure to distinguish
Do not treat legacy BuckleScript/Reason projects as universally compatible with recent ReScript compilers.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible ReasonML environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.
