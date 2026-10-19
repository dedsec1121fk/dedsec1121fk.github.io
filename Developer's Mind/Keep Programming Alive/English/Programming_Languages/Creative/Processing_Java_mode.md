# processing_java_mode — consolidated language guide

## Processing (Java mode)

### Mental model
Processing's Java mode makes drawing loops and mouse/keyboard interaction accessible through sketch lifecycle callbacks.

### Minimal source sample
```text
void setup() { size(300, 200); }
void draw() { background(20); ellipse(150,100,50,50); }
```

### Experiment to carry out
Modify the ellipse's x-coordinate from a fixed value to mouseX and note how draw() repeatedly repaints.

### A specific failure to distinguish
Calling background each frame erases previous drawings; persist state if a trail is intended.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Processing_Java_mode environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Processing_Java_mode — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Processing Java mode. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
void setup() {
  println("Hello, Ada!");
  exit();
}
~~~

**Run context:** Run from Processing IDE (Java mode).. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Animate a circle on a 400x240 canvas. Change from x += 1 per draw() to elapsed-time motion using millis(); test pause/resume and a bounce that accounts for the radius.

### Boundary-case investigation
Background clearing controls trails; frameRate is only a target, not guaranteed. Processing Android mode is not the same as Java-mode sketch execution.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Processing Java mode. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.

## Processing_Java_mode — Focused mastery pathway

### Applied exercises

1. Vary a deterministic seed and predict how generated output changes.
2. Separate coordinates, color parameters and state updates.
3. Respect host-specific runtime and drawing APIs; verify the example inside its proper environment.

- What is calculated once and what updates each frame?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
