# hy — consolidated language guide

## Hy

### Working model
Hy uses Lisp-style expressions on Python's object model. Macros transform syntax before normal evaluation; host Python objects and imports remain available.

### Focused source example
```text
(setv readings [2 4 6])
(print (sum readings))
```

Create a second list containing zero and a negative number, then show whether the sum changes predictably. Contrast quoting a form with evaluating it.

### Evidence to collect
Record the exact Hy compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Macro expansion and runtime function calls occur at different stages; do not treat Hy syntax as literal Python syntax.

### Follow-up challenge
Transform this example using a second input and explain one limiting case that alters its behavior. State where platform-specific libraries or tooling can affect the outcome; if no compatible runtime is installed, document the static reasoning honestly and distinguish it from a passing execution test.

## Hy: applied exercises

### Begin with the smallest observable program
The companion `00_starter.hy` prints `Hello, Hy!`. In a disposable environment with Hy installed, run that file and record the Hy and Python versions. Hy compiles Lisp-like expressions into Python-compatible behavior; unfamiliar parentheses do not mean the runtime has different exception semantics from Python.

### Transform data without hiding the steps
Create a scratch `squares.hy` and examine this expression:

~~~hy
(setv values [1 2 3])
(setv squares (list (map (fn [n] (* n n)) values)))
(print squares)
(print (sum squares))
~~~

The predicted Python-list-like values are 1, 4, 9 and the sum is 14. Trace from the innermost multiplication outward: `fn` creates the one-argument function, `map` applies it to each value, `list` materializes the iterator, and `sum` aggregates the result. Don't confuse an iterator with a fully evaluated list. Confirm exact printed formatting with the installed interpreter instead of treating a screenshot as a language specification.

### Probe a real Python exception
Evaluate `(print (/ 1 0))` in a separate file. The arithmetic must fail rather than printing a finite result. Save the actual traceback and identify the division expression, not the final print call, as the source. Use an exception handler only after reproducing the failure; otherwise it may conceal a wrongly typed input or an unintended operator.

### Understand evaluation
Compare `(list (map (fn [n] (+ n 1)) [1 2 3]))` with a list comprehension written in ordinary Python. Explain the same logical input-output mapping despite different syntax. Next change the input list to empty, then to values containing strings, and classify whether the operation produces an empty result or an exception. A list of mixed types is a type-contract test, not evidence that Hy ignores types.

### Independent extension
Implement a function that rejects negative scores and computes the sum of nonnegative squares, then test `[]`, `[0]`, `[-1]` and `[2 3]`. State whether you filter, reject or normalize invalid data; those choices are not interchangeable. Run in an isolated interpreter and report versions and actual diagnostics. Reference: https://hylang.org/

## Hy — Focused mastery pathway

### Foundation exercise
Create a Hy script importing a Python standard-library function and calling it from Lisp-style parenthesized forms.

### Problem-solving exercise
Implement list mapping and a small predicate in Hy, comparing the emitted behavior to equivalent Python code. Distinguish quoted data from evaluated forms.

### Independent project
Write a file summarizer that reads a disposable UTF-8 fixture and reports validation errors without modifying source files. Pin the Hy release because macros and syntax change.
