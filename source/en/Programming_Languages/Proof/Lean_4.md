# lean_4 — consolidated language guide

## Lean 4

### Operational idea
Lean 4 combines theorem proving with a functional language; propositions and programs share typed expression machinery.

### Source or deliberately marked concept
```text
def double (n : Nat) : Nat := n + n
#eval double 4
```

### Apply it to one controlled task
Distinguish evaluation of a function from proof of a universal property. Sketch the induction cases for a basic theorem.

### Check the important boundary
A successful example evaluation cannot certify a theorem for every natural number.

Work with disposable data in a genuine implementation of Lean_4 where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Lean_4 — Expanded practice workbook

### Inspect the smallest source
~~~text
def greet (name : String) : String := "Hello, " ++ name ++ "!"
#eval greet "Ada"
~~~

**Run or compilation context:** lean Hello.lean.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Prove a simple equality by rfl and then prove n + 0 = n for Nat by induction or a named theorem. Confirm the environment has no sorry or axioms introduced.

### Diagnose the sharp edge
Lean 4 syntax is not Lean 2/3 syntax; old tutorials can silently suggest obsolete keywords and tactics.
