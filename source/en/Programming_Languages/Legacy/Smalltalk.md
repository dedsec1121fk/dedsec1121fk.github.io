# smalltalk — consolidated language guide

## Smalltalk

### Mental model
Smalltalk systems center on message sending and live object images; code is normally explored inside a Smalltalk environment.

### Minimal source sample
```text
Transcript show: (3 + 4) printString; cr.
```

### Experiment to carry out
Observe message sends in a workspace and distinguish inspecting an object from serializing its representation.

### A specific failure to distinguish
Image state and installed packages can affect a result; save a clean image snapshot before experimentation.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Smalltalk environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Smalltalk — Expanded practice workbook

### Inspect the smallest source
~~~text
Transcript show: 'Hello, Ada!'; cr.
~~~

**Run or compilation context:** Load in Pharo or another Smalltalk image.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Send messages to a collection, use collect: and select: to transform it and inspect self versus super dispatch in a small class.

### Diagnose the sharp edge
An image-based Smalltalk workspace preserves state across sessions; rerun in a clean image before trusting an experiment.

## Smalltalk — Focused mastery pathway

### Environment and mental model
Use a Pharo Smalltalk Playground. Objects receive messages; the syntax stock at: 'bolt' put: 3 sends a keyword message with two arguments. A cascade uses a semicolon to send multiple messages to the **same original receiver**, which differs from a chain of return values.

### Execute in a Playground
~~~smalltalk
| stock total |
stock := Dictionary new.
stock at: 'bolt' put: 3.
stock at: 'nut' put: 2.
total := stock values inject: 0 into: [ :sum :quantity |
    sum + quantity
].
Transcript show: total printString; cr.
Transcript show: (total = 5) printString; cr.
~~~
Expected Transcript lines are 5 and true. Dictionary maps keys to values; inserting the *same* key again changes the value rather than adding a second item. The inject:into: block starts at 0 and folds over the values; the sum does not depend on dictionary iteration order.

### Error and design experiments
1. Change the quantity of bolt to 7. Recompute total and observe that the dictionary still has two keys.
2. Query a missing key using at: and inspect the exception. Use at:ifAbsent: for a deliberate fallback; never present a caught exception as a successful lookup.
3. Replace Dictionary with OrderedCollection. Compare indexed, ordered elements against key-based access and choose based on the desired invariant.
4. Make the stock empty. Folding from 0 should yield 0, not fail on an absent first element.
5. Write a small SUnit test for insert/replacement behavior and test a missing key separately from zero stock.

### Evidence
Record exact Pharo image/version, Playground snippet, Transcript output and the SUnit results you really executed. Other Smalltalk dialects may use different tooling and global Transcript conventions. Reference: https://ctskennerton.github.io/2020/12/21/using-dictionaries-in-pharo-smalltalk/
