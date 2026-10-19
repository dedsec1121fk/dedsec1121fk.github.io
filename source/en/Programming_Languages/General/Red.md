# red — consolidated language guide

## Red

### Working model
Red combines a high-level Red language with a lower-level Red/System dialect for systems-oriented work. They have different capabilities and constraints.

### Focused source example
```text
Red []
items: [10 20 30]
print length? items
```

Add and remove one element from the block, then distinguish the block's length from its individual values.

### Evidence to collect
Record the exact Red compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
A Red block is not a JSON array and Red/System is not a drop-in mode for ordinary Red expressions.

## Red: applied exercises

### Read the runnable header
Red source files start with a `Red [ ... ]` header, which identifies the program and may include metadata. Put this in a fresh `squares.red`, retaining the bracketed header:

~~~red
Red [Title: "Squares"]
numbers: [1 2 3]
foreach n numbers [
    print (n * n)
]
~~~

Predict three numeric lines: 1, 4, 9. Parentheses force the multiplication to be evaluated as a group before printing. Compare a Red interpreter invocation with any available compile/run command from its installed release; desktop and mobile support vary. This is a proposed test and no Red runtime output is claimed here.

### Understand a block rather than a string
The `numbers` value is a block of Red values, not the text `"[1 2 3]"`. A `foreach` loop binds one value to `n` on each iteration. Replace the block with `[]` and explain why there are no printed numbers. Add zero and a negative input and predict the same square law without inventing a new loop construct.

### Locate a parsing or type failure
In a separate scratch file, deliberately remove the closing bracket after the loop body. Capture the parser error and compare it with an evaluation error when multiplying a word that was never assigned a numeric value. The failures are conceptually different: the parser cannot finish one program while the evaluator rejects an operation in another.

### Independent project
Write a word that returns a list of squares instead of printing them. Explain where its result is stored, how the caller inspects the block, and why printing is a side effect. Check empty input, duplicate values and large integer arithmetic under the chosen implementation. Record the exact Red version and platform. Reference: https://www.red-lang.org/

## Red — Focused mastery pathway

### Language model and syntax
Evaluate a small Red block of arithmetic values and compare literal block data with evaluated expressions in the console.

### Intermediate exercise and counterexample
Construct a function that validates an integer argument and produces a distinct error path for nonnumeric input. Trace Red's series operations on a three-element list.

### Independent project and verification
Build a tiny VID graphical display where supported, with a button that changes a counter. Document platform/backend capabilities rather than assuming all Red runtime targets support the same GUI.
