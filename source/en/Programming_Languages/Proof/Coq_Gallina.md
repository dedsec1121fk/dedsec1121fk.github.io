# coq_gallina — consolidated language guide

## Coq / Gallina

### Mental model
Gallina is the term and function language used by Coq/Rocq proof development, where definitions must satisfy guardedness and typing constraints.

### Minimal source sample
```text
Definition inc (n : nat) : nat := S n.
Compute (inc 3).
```

### Experiment to carry out
Evaluate the successor and explain why the number is represented by an inductive natural-number type.

### A specific failure to distinguish
A failed proof obligation is not repaired by assuming the desired theorem; inspect its hypotheses and reduction steps.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Coq_Gallina environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Coq_Gallina — Expanded practice workbook

### Inspect the smallest source
~~~text
Definition answer : nat := 42.
Compute answer.
~~~

**Run or compilation context:** coqc Hello.v.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
State and prove forall n : nat, n + 0 = n using induction. Inspect the proof state before and after induction and reject Admitted as completion.

### Diagnose the sharp edge
Tactic scripts are version-sensitive and lemma names may differ. A successful computation is not the same as a closed theorem proof.
