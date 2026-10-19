# standard_ml — consolidated language guide

## Standard ML

### Working model
Standard ML is a strict functional language with algebraic data types, pattern matching and static type inference.

### Focused source example
```text
fun sum [] = 0
  | sum (x::xs) = x + sum xs;
val total = sum [1,2,3];
```

Follow recursive calls from the list [1,2,3] to the empty base case; add a pattern for an empty collection in any new function.

### Evidence to collect
Record the exact Standard_ML compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
A non-exhaustive pattern match may fail at runtime; use compiler exhaustiveness warnings.

## Standard ML: applied exercises

### A polymorphic list function
Standard ML can describe absence without a magic element value. Save this in a scratch `head.sml`:

~~~sml
fun safeHead [] = NONE
  | safeHead (x :: _) = SOME x;

val _ = case safeHead [3, 4] of
    SOME 3 => ()
  | _ => raise Fail "unexpected head";

val _ = case safeHead ([] : int list) of
    NONE => ()
  | _ => raise Fail "expected empty";
~~~

The expected outcome is no exception and no required console output. `NONE` differs from `SOME 0`, and using a typed empty list avoids ambiguity at the test site. Run in a compatible SML compiler or REPL; note implementation version and how it handles top-level value declarations.

### Why pattern coverage matters
Remove the empty-list clause from `safeHead` in a disposable copy. The compiler may warn about non-exhaustive patterns; calling the function with `[]` can then produce a match failure. A compiler warning is not guaranteed to stop every build. Record both the warning policy and runtime symptom, rather than presenting one as the other.

### Lists versus equality constraints
The function is polymorphic in the element type because it does not compare or perform arithmetic on elements. Extend it with a function that checks whether the first item equals an argument and inspect the type inferred for equality-type variables. Explain why functions used with `=` may require equality types, unlike unconstrained element access.

### Independent exercise
Define `safeLast` with explicit cases for empty, singleton and longer lists. Test `[]`, `[9]` and `[9, 4]`; reason about recursive traversal cost. Write a second version carrying an accumulator, compare its failure contract, and avoid confusing `nil` (empty list) with the `NONE` option constructor. Reference: https://smlfamily.github.io/
