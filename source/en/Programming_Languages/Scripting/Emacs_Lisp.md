# emacs_lisp — consolidated language guide

## Emacs Lisp

### Mental model
Emacs Lisp is a Lisp dialect embedded in the Emacs editor and closely tied to buffers, hooks and interactive commands.

### Minimal source sample
```text
(+ 2 3)
(message "Sum: %d" (+ 2 3))
```

### Experiment to carry out
Evaluate the expressions in an Emacs scratch buffer; distinguish return value from echo-area messages.

### A specific failure to distinguish
Buffer-local values and interactive state are not the same as ordinary global variables; use a disposable buffer for tests.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Emacs_Lisp environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Emacs_Lisp — Expanded practice workbook

### Read the baseline source
~~~text
(defun greet (name) (concat "Hello, " name "!"))
(princ (concat (greet "Ada") "\n"))
~~~

**Relevant environment:** emacs --batch -Q -l hello.el.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Define an interactive command that inspects the current buffer without modifying it. Compare buffer-local variables with lexical-binding and test nil handling.

### The failure that must be understood
A Lisp expression evaluated in the wrong buffer affects behavior; use with-current-buffer and avoid save-buffer unless explicitly intended.

## Emacs_Lisp — Focused mastery pathway

### Foundation exercise
Define an interactive Emacs Lisp command that reports the current buffer's size without modifying its contents.

### Problem-solving exercise
Compare let-bound lexical state with a buffer-local variable. Open two buffers and show how buffer-local values differ while shared global variables remain shared.

### Independent project
Package the command as a small minor mode and test activation/deactivation. Ensure no unwanted buffer edits or persistent keybindings remain when the mode is disabled.
