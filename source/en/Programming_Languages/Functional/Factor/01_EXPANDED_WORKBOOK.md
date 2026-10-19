# Factor — calculate a stack effect rather than guessing parameters

## A word with one input and one output

~~~factor
USING: kernel math prettyprint ;
IN: square-lab
: square ( n -- n ) dup * ;
5 square .
~~~

The stack comment ( n -- n ) states one consumed input and one produced output. dup copies 5; multiplication consumes the two copies and leaves 25, then the printing word displays it. Confirm the correct vocabulary or listener loading steps for your Factor release before running.

## Diagnose a stack underflow

Change the body to * without dup. The word now needs two inputs but its declared effect and caller supply one. Explain why a stack underflow is different from an object-method arity error. Next try dup dup * and inspect the extra value that survives on the stack.

## Independent task

Define a parity-check word and test 0, -2 and 7. Annotate each individual word's effect and compare stack state before and after execution. Record the exact Factor implementation and toolchain behavior. The sample's result is predicted from stack semantics and has not been measured in a Factor runtime.

## Track an unintended extra stack value
Begin a listener experiment with an empty stack. Run 5 dup dup * and write the stack after every word. After the two dup operations the stack is 5 5 5; multiplication consumes the top two and leaves 5 25, not a single number. If a following word assumes exactly one value, the hidden 5 changes later behavior. Factor stack comments are a contract for humans and tools, not a substitute for testing the implementation. Make a second word that accepts two numbers and leaves their average; identify which math words introduce conversions and whether integer division differs from floating-point division in your Factor version.

## Factor

**Typical use:** Functional programming.

**Suggested file extension:** `.factor`.

**How to run / environment:** Load within the Factor language environment.

### Starter example

```
USING: io ;
IN: scratchpad
"Hello, Ada!" print
```

### How to read it

Factor is concatenative; avoid confusing its executable with Unix factor.

### Common pitfall

Factor is concatenative; avoid confusing its executable with Unix factor.
