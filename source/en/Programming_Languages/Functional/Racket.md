# racket — consolidated language guide

## Racket

### How the language behaves
Racket supports functional programming and a language-oriented approach with macros, modules and contracts.

### Source fragment to analyze
```text
#lang racket
(define (square x) (* x x))
(displayln (square 5))
```

### Deliberate exercise
Predict the printed value and add a contract or predicate to reject nonnumeric inputs before multiplying.

### Check a failure condition
A quoted list is data, not automatically an executed program; learn the difference before experimenting with macros.

Record input, expected output and observed output with the actual Racket implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Racket — Expanded practice workbook

### Use an executable module
Racket's `#lang` selects the language and affects available bindings. Write the following into `sum-list.rkt`, not into an unrelated Scheme dialect:

~~~racket
#lang racket
(require rackunit)
(define (sum-list xs)
  (cond [(empty? xs) 0]
        [else (+ (first xs) (sum-list (rest xs)))]))
(check-equal? (sum-list '()) 0)
(check-equal? (sum-list '(1 2 3)) 6)
(check-equal? (sum-list '(-2 5)) 3)
(displayln "checks passed")
~~~

Run `racket sum-list.rkt`. With `rackunit` available, the expected message is `checks passed`; otherwise a failing check raises an exception. This uses structural recursion, where each recursive call consumes the rest of the list until the empty-list case. It has not been run using an installed Racket runtime here.

### Prove termination and the base case
Explain why `(rest xs)` makes a strictly shorter finite list, and why `empty?` must be checked **before** calling `first`. Remove the base case only in a disposable copy: the failure demonstrates a broken domain/termination contract, not that recursion is inherently unsafe. A deeply nested list may encounter resource limits even when the mathematical procedure terminates.

### Test invalid element types
Try `(sum-list '(1 "two"))` and record the actual contract error from `+`. Make a decision: accept only numeric lists, validate each item before summing, or return a structured error. Do not quietly replace arbitrary nonnumeric values with zero; that masks a malformed input record.

### Comparative extension
Implement the same result with `(apply + xs)` or `for/sum` and compare the empty and negative-value cases. Explain evaluation and recursion cost rather than assuming a faster result from shorter syntax. Add `(check-exn exn:fail? (lambda () (sum-list '(1 "two"))))` to turn the expected failure into a test. Record language version and source file. Reference: https://docs.racket-lang.org/rackunit/
