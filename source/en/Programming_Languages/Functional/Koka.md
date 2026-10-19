# koka — consolidated language guide

## Koka

### Working model
Koka tracks computational effects in function types; a function that can fail or perform I/O communicates that fact through its effect annotations.

### Focused source example
```text
// Conceptual effect signature:
// parse : string -> <exn> int
```

Design a parser for positive integers. Mark ordinary returned values separately from failure, then identify callers that must handle the effect.

### Evidence to collect
Record the exact Koka compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Effect typing is not the same as a try/catch around every call; avoid inventing type syntax for a compiler version you have not checked.

## Koka: applied exercises

### Confirm the supplied program
`00_starter.kk` uses `fun main()` and `println("Hello, Koka!")`. Its observable effect is console output, not a returned numeric value. Compile or run the starter according to the installed Koka version and record both its output and compiler version. Compiler flags and available libraries may differ; the following is a study exercise, **not a claimed execution**.

### Introduce a pure helper
In a disposable copy, add a small typed function while keeping printing in `main`:

~~~koka
fun double(n : int) : int
  n + n

fun main()
  println(double(3))
~~~

Predict that the console displays `6`. The helper computes an integer and has no console operation; `main` performs the observable output. Under Koka's effect typing, the compiler tracks such distinctions in function types. Do not conflate lack of printing in one function with a guarantee that an arbitrary called function is pure.

### Probe the type checker
Replace `n + n` with the string literal `"six"` while retaining the declared `: int` result. Save the actual type error and revert the change. Then keep the numeric helper but try to call it with a string argument. These are separate mismatches: return-contract failure versus argument-type failure. A compiler error is the expected learning evidence; no crash or external service is needed.

### Investigate effects without hiding them
Move `println` into a new helper and examine the inferred or annotated effect of that helper. Compare it with the original integer-only function. Koka's `total` and `console` effect labels express different possible behavior; they are not timing or performance metrics. Refer to the compiler's displayed types instead of guessing at their exact formatting.

### Independent exercise
Write `fun triple(n : int) : int` and print results for zero, a negative value and a positive value. Sketch expectations first. Add one deliberately ill-typed use and explain the error with the concrete expression responsible. Note the compiler release because Koka is an evolving research language. Reference: https://koka-lang.github.io/koka/doc/book.html
