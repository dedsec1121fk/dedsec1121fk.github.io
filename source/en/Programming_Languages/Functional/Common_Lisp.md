# common_lisp — consolidated language guide

## Common Lisp

### Operational idea
Common Lisp is a multi-paradigm Lisp with macros, packages and the condition system.

### Source or deliberately marked concept
```text
(defun double (n) (* n 2))
(double 5)
```

### Apply it to one controlled task
Compare evaluating a quoted form with invoking double; then design a function accepting a list of numbers.

### Check the important boundary
Package symbols and lexical variables are different concepts; avoid accidental collisions when composing libraries.

Work with disposable data in a genuine implementation of Common_Lisp where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Common_Lisp — Expanded practice workbook

### A value plus a presence flag
Common Lisp `car` of NIL returns NIL, so using NIL alone as a missing-value marker can be ambiguous. A second return value can describe presence:

~~~lisp
(defun safe-first (items)
  (if (consp items)
      (values (car items) t)
      (values nil nil)))

(multiple-value-bind (item present) (safe-first '(10 20))
  (assert (and present (= item 10))))
(multiple-value-bind (item present) (safe-first nil)
  (assert (and (null item) (not present))))
(format t "checks passed~%")
~~~

Load this in a Common Lisp implementation such as SBCL and note its version. The expected printed message is `checks passed`. `values` and `multiple-value-bind` are language mechanisms, not ordinary cons cells or list elements. Compare calling `safe-first` in a context that consumes only its primary value.

### Why nil is not always a missing record
Consider `(safe-first '(nil 5))`. The first return value is NIL but the presence flag must be true. If the caller ignored the second result, it could falsely conclude that the list was empty. Explain how this differs from a list of strings in which empty string is itself a valid value.

### Deliberate type error
Try applying `(+ "2" 3)` in a disposable REPL and capture the actual type-condition message. Do not rely on a particular debugger restart prompt: the available restarts and interactive UI are implementation-specific. Handle a genuine type mismatch rather than forcing arbitrary strings into arithmetic.

### Further exercise
Write `safe-last` that distinguishes an empty proper list from a final element equal to NIL. Test `()`, `(1 2)` and `(1 nil)`; explain how `listp` differs from checking whether a nonempty cons cell exists. Document evaluation of optional and keyword parameters in a second function. Reference: https://www.lispworks.com/documentation/HyperSpec/Front/
