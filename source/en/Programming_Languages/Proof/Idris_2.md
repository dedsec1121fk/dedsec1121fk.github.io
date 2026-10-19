# idris_2 — consolidated language guide

## Idris 2

### Operational idea
Idris 2 uses dependent types so values can appear in types, helping express stronger invariants in program signatures.

### Source or deliberately marked concept
```text
double : Nat -> Nat
double n = n + n
```

### Apply it to one controlled task
Study the type before evaluating double 3. Contrast a Nat argument with an unvalidated string from external input.

### Check the important boundary
A proof about a type only applies after values have been converted into that type with appropriate validation.

Work with disposable data in a genuine implementation of Idris_2 where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Idris_2 — Expanded practice workbook

### Inspect the smallest source
~~~text
module Hello
main : IO ()
main = putStrLn "Hello, Ada!"
~~~

**Run or compilation context:** idris2 Hello.idr -x main.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Define a vector head operation requiring a non-empty length and test that an empty vector fails type checking. Compare dependent length with a runtime list length.

### Diagnose the sharp edge
Idris 2 is distinct from deprecated Idris 1; use a matching compiler and never erase a failing type obligation with a hole.
