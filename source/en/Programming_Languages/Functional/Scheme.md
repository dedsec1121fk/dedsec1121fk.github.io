# scheme — consolidated language guide

## Scheme

### Mental model
Scheme is a Lisp-family language emphasizing lexical scope, functions and a small core; particular standards and implementations vary.

### Minimal source sample
```text
(define (sum xs)
  (if (null? xs) 0 (+ (car xs) (sum (cdr xs)))))
```

### Experiment to carry out
Trace the recursive list sum and prove that the empty list ends recursion; then test a singleton list.

### A specific failure to distinguish
Scheme syntax and libraries vary by R5RS/R7RS and interpreter; avoid silently using implementation-specific extensions.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Scheme environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Scheme — Expanded practice workbook

### R5RS-compatible exercise
Many Scheme implementations offer different extensions. Keep the core example in standard Scheme forms:

~~~scheme
(define (first-result xs)
  (if (null? xs)
      (list 'empty)
      (list 'value (car xs))))
(display (first-result '(7 8)))
(newline)
(display (first-result '()))
(newline)
~~~

Expected structures are `(value 7)` and `(empty)`. The tagged result is intentional: returning only `#f` as a missing-value sentinel could collide with a valid first item that actually equals `#f`. Compare `(first-result '(#f 2))` to verify the distinction. Run with an R5RS-compatible mode, if necessary, and record the Scheme implementation and version.

### Guard the domain before calling car
Calling `car` on an empty list violates its input contract. The conditional checks `null?` before accessing a head element. Make a deliberately broken function that calls `car` without checking, then capture the actual implementation-specific diagnostic. Some Scheme dialects provide extra exception constructs; do not pretend those are guaranteed by every R5RS interpreter.

### Structural recursion experiment
Define a function that sums a proper list of numbers with `(if (null? xs) 0 (+ (car xs) (sum-list (cdr xs))))`. Prove that each call processes a shorter finite list and test negative numbers and an empty list. A dotted pair is not a proper list and can invalidate assumptions about `cdr` eventually returning the empty list.

### Independent investigation
Compare equality using `eq?` and `equal?` for pairs and numbers; state which comparison matches the intended semantic contract. Avoid relying on incidental object identity for structural data. Document whether your interpreter conforms to R5RS or an extended dialect. Standard: https://standards.scheme.org/
