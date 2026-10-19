# brainfuck — consolidated language guide

## Brainfuck

### Mental model
Brainfuck is a deliberately minimal esoteric language with a moving cell pointer and eight symbolic instructions.

### Minimal source sample
```text
+++[>++<-]>.
```

### Experiment to carry out
Trace pointer position and cell contents after each loop iteration; determine what byte the output instruction emits.

### A specific failure to distinguish
Cell width, EOF behavior and wraparound are interpreter choices; do not infer one portable standard for them.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Brainfuck environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Brainfuck — Focused mastery pathway

### Stage 1: understand the execution model
Start from a zeroed tape and trace +++++[>+++++<-]>. on paper. At every bracket, write the pointer location and cell values; verify that the loop repeats five times and emits a byte value of 25.

### Stage 2: prove the rule with controlled cases
Modify only the loop's initial count and derive the output byte without running the interpreter first. Compare wrapping 8-bit cells with interpreters using wider cells; the source does not define an identical overflow policy everywhere.

### Stage 3: build a small, reviewable project
Create a minimal program that reads one byte and echoes it, then test EOF and tape boundaries in your chosen interpreter. Produce a table of pointer moves, byte values and termination; never assume an implementation's EOF behavior.

### Brainfuck interpreter correctness fixture
A cell is not a character; output emits a byte. Define whether arithmetic wraps modulo 256 and whether tape indices may be negative. Before execution, scan the source to match brackets using a stack: push every opening position, pair each closing bracket with the most recent opening, and reject leftovers. Then run the controlled fixture:
~~~text
+++[>++<-]>.
~~~
The final value in cell 1 is six if cells start at zero. The output byte is 0x06, not ASCII digit '6'. Test unbalanced '[' and ']', nested loops, EOF on ',', and an intentionally nonterminating loop; limit executed steps to prevent a hung test. Compare an optimized interpreter with a literal reference interpreter on random terminating programs.
