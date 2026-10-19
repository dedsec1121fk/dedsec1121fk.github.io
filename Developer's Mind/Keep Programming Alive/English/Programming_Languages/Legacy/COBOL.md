# cobol — consolidated language guide

## COBOL

**Typical use:** Historical and enterprise languages.

**Suggested file extension:** `.cob`.

**How to run / environment:** cobc -x -free hello.cob && ./hello.

### Starter example

```
identification division.
program-id. hello.
procedure division.
    display "Hello, Ada!".
    stop run.
```

### How to read it

COBOL remains significant in business systems.

### Common pitfall

COBOL remains significant in business systems.

## COBOL — Expanded practice workbook

### Inspect the smallest source
~~~text
identification division.
program-id. hello.
procedure division.
    display "Hello, Ada!".
    stop run.
~~~

**Run or compilation context:** cobc -x -free hello.cob && ./hello.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Create a fixed-width customer record with PIC fields, validate a numeric amount and produce a totals report. Compare edited picture clauses with stored numeric representation.

### Diagnose the sharp edge
Column format, decimal settings and packed numeric fields differ by compiler and file conventions. Preserve fixtures before conversion.

## COBOL — Focused mastery pathway

### Learn the memory and execution model
Create a fixed-format or free-format COBOL program (state the format) containing a PIC 9(5)V99 amount and a displayed edited amount. Trace stored value separately from displayed punctuation.

### Deliberate failure and corrective experiment
Read three fixed-width input records in a scratch directory, rejecting unexpected record lengths and nonnumeric amount data before adding totals. Inspect FILE STATUS rather than assuming successful OPEN/READ.

### Independent engineering assignment
Implement a small customer balance report with a test copybook defining the shared record layout. Test missing file, all-zero balance, and large amount; compare decimal precision with float-based calculations.
