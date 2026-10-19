# logo — consolidated language guide

## Logo

### Operational idea
Logo is an educational programming language often used to teach recursion and turtle graphics.

### Source or deliberately marked concept
```text
REPEAT 4 [FORWARD 50 RIGHT 90]
```

### Apply it to one controlled task
Predict the turtle's final heading and location after drawing a square. Change the angle to test why the path no longer closes.

### Check the important boundary
Commands and coordinate systems vary among Logo dialects; confirm the turtle graphics implementation.

Work with disposable data in a genuine implementation of Logo where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Logo — Focused mastery pathway

### Stage 1: understand the execution model
Trace a turtle's heading after FORWARD 60, RIGHT 90, FORWARD 60, and LEFT 90. Draw the resulting two segments on graph paper; verify that LEFT and RIGHT change orientation without moving the turtle.

### Stage 2: prove the rule with controlled cases
Use REPEAT 4 [FORWARD 60 RIGHT 90] to produce a square. Generalize with REPEAT n and turns of 360/n degrees. Explain how the closing orientation depends on integer and angular arithmetic.

### Stage 3: build a small, reviewable project
Write a reusable polygon procedure accepting side count and length; reject nonpositive values. Compare a closed pentagon with a spiral whose side length grows. Save screenshots of coordinates and one malformed parameter case.

### What counts as mastery here
Demonstrate the output or the compiler/simulator diagnostic for each stage, document the exact toolchain, and supply a counterexample. If the required runtime is proprietary, unavailable or version-dependent, clearly mark the exercise as unverified instead of inventing an execution result.

### Turtle state-machine proof and runnable Logo exercise
~~~logo
TO SQUARE :SIDE
  REPEAT 4 [FORWARD :SIDE RIGHT 90]
END
SQUARE 40
~~~
Before running, write the starting (x, y, heading). After every edge, record the new coordinates and heading. The endpoint and final heading should equal the starting state apart from floating-point tolerance. Change four sides to seven, with a 360/7 turn, and measure drift rather than assuming exact equality. Test zero length separately and reject fewer than three sides. As a stretch task, draw a five-point star with 144-degree turns and explain why a 72-degree exterior turn creates a different figure. Save actual screenshots and interpreter version.

## Scratch (textual pseudocode)

**Typical use:** Learning languages.

**Suggested file extension:** `.txt`.

**How to run / environment:** Recreate the blocks manually in Scratch; text is a transcript.

### Starter example

```
when green flag clicked
set [name v] to [Ada]
say (join [Hello, ] (name))
```

### How to read it

Scratch is visual: this is a readable transcript, not importable code.

### Common pitfall

Scratch is visual: this is a readable transcript, not importable code.

## Scratch_textual_pseudocode — Focused mastery pathway

### Stage 1: understand the execution model
Create a Scratch project with two sprites; when the green flag is clicked, sprite A sets score to zero and broadcasts start. Sprite B receives start and changes a visible label. Write the exact event sequence.

### Stage 2: prove the rule with controlled cases
Compare broadcast and broadcast-and-wait in the real Scratch block editor. Insert timed waits in both sprites and predict whether another script can observe an intermediate score. Record screenshots and timestamps instead of assuming concurrency order.

### Stage 3: build a small, reviewable project
Build a three-state game menu: title, playing, game-over. Specify which message transitions each state and prevent a click from triggering two transitions. Pseudocode in this archive is for planning, not an importable .sb3 file.
