# isabelle — consolidated language guide

## Isabelle/HOL

### Working model
Isabelle is a proof assistant; propositions are checked against declared logical contexts rather than merely exercised with test inputs.

### Focused source example
```text
lemma add_zero: "n + (0::nat) = n"
  by simp
```

Read the role of the natural-number type annotation, then change one premise and see whether the automated simp method can still prove it.

### Evidence to collect
Record the exact Isabelle compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
A theorem prover rejecting a goal is not evidence the goal is false; distinguish lack of proof from a counterexample.

## Isabelle: applied exercises

Read the [Isabelle introduction](Isabelle.md). Isabelle checks statements under declared mathematical assumptions. Unit tests on sample inputs do not constitute a proof over all natural numbers. This exercise uses the standard Main theory, a real proof command and one false statement with a concrete counterexample.

### Build a minimal theory file
Create `Numbers.thy` inside an Isabelle session:

~~~isabelle
theory Numbers
  imports Main
begin

lemma right_zero: "n + (0::nat) = n"
  by simp

lemma left_zero: "(0::nat) + n = n"
  by simp

end
~~~

Open it with Isabelle/jEdit or validate via your installed session build tools. Explain why both goals hold for all natural numbers, not just specific test values. The annotation `(0::nat)` chooses a type for an otherwise ambiguous numeral. The proof method `simp` uses existing simplification rules; it is not a runtime assertion.

### Counterexample versus failed proof search
Make a disposable copy, then change the first goal to `n + (0::nat) = n + 1`. For n=0, its two sides evaluate to 0 and 1, so the modified claim is false. Attempting `by simp` should not finish a valid proof. Never repair this by inserting `sorry` or adding an unsound axiom. A tactic failure for an arbitrary goal does **not** generally demonstrate falsity; here falsity follows from the counterexample.

### Distinguish proof, syntax and environment errors
Remove `by simp` from a working copy and inspect the remaining proof obligation. Restore it. Deliberately misspell `imports Main` and distinguish a missing-theory load error from an unproved mathematical claim. Finally prove commutativity, `(n::nat) + m = m + n`, with a documented library theorem or appropriate simplifier setting.

**Evidence:** Isabelle version, a saved valid theory, two accepted proofs, a counterexample to one false statement and the actual proof state or diagnostic. If Isabelle is absent, provide a **paper derivation only**; do not claim the source was verified.
