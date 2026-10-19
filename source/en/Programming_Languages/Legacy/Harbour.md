# harbour — consolidated language guide

## Harbour

### Working model
Harbour continues the xBase/Clipper-style business application tradition with records, databases and procedures oriented toward compiled desktop applications.

### Focused source example
```text
PROCEDURE Main()
   ? "Hello from Harbour"
RETURN
```

Make a tiny console program, then explore the difference between opening a DBF table and creating an in-memory array.

### Evidence to collect
Record the exact Harbour compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
DBF encoding, codepages and record locking deserve explicit tests when maintaining legacy data.

## Harbour: applied exercises

Harbour is a modern open-source descendant in the xBase family; its procedural entry points, LOCAL variables and question-mark output syntax should not be mistaken for SQL or an ordinary Python interpreter. The initial task needs only console output. Database work should come later, in disposable sample files.

### Exercise 1: follow a local integer

~~~harbour
PROCEDURE Main()
   LOCAL n := 2
   ? n * 3
RETURN
~~~

The expected numeric output is 6. Change n to -2 and explain why multiplication produces -6, while the procedure still reaches RETURN. Distinguish the LOCAL declaration's scope from a global variable. Name the routine Main rather than copying an entry point from C or Java.

### Exercise 2: avoid silent assumptions about text

Harbour values can be inspected with ValType(). Consider an input representing a quantity as the text "12" rather than a numeric 12. State why a type-sensitive design must validate or convert it before arithmetic. A string containing spaces is not automatically equivalent to an absent or NIL value. Sketch two input checks: one rejecting nonnumeric text, the other accepting a tested numeric conversion.

### Exercise 3: isolated table records

In an approved exercise directory, design a tiny DBF-backed inventory with a code and quantity. Show how the key would be used to locate a record and why updates to a table require a separate explicit action. Do not suggest experiments against an existing business DBF file. Explain how record locking, character encodings and file sharing can affect a database-backed program even when a console arithmetic routine works perfectly.

### Verification and environment

Document Harbour compiler version, host OS, compile command (taken from that version's documentation), actual output and the value type of each input. If you cannot run a compatible toolchain, mark all outputs as predicted. To pass, demonstrate understanding of LOCAL scope, an xBase-compatible routine, a type mismatch and a safe distinction between display and persistent data mutation.

## Harbour — Focused mastery pathway

### Learn the memory and execution model
Write a Harbour program using a DBF-style test table and display a count without modifying the user's real data files.

### Deliberate failure and corrective experiment
Navigate a work area with selected records, test deleted versus active rows and identify the effect of SET DELETED within the installed runtime.

### Independent engineering assignment
Create a reversible offline inventory report using a copy of a DBF file, with backups and schema assumptions documented. Compare Harbour dialect extensions with xBase code originally written for Clipper.
