# rexx — consolidated language guide

## REXX

### How the language behaves
REXX is used for scripting and host integration, notably in historical and mainframe environments, with string-centric control flow.

### Source fragment to analyze
```text
total = 0
do i = 1 to 3
  total = total + i
end
say total
```

### Deliberate exercise
Trace the loop to six, then identify which external commands would require host-specific facilities rather than core REXX.

### Check a failure condition
Case-insensitive identifiers do not imply all host APIs are portable; record the interpreter and environment.

Record input, expected output and observed output with the actual REXX implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## REXX — Expanded practice workbook

### Inspect the smallest source
~~~text
say "Hello, Ada!"
~~~

**Run or compilation context:** Run with a REXX interpreter.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Parse command arguments with PARSE ARG, normalize a string and generate a report of counted tokens. Probe behavior with leading/multiple blanks.

### Diagnose the sharp edge
Classic REXX and ooRexx have different extension facilities. STEM variables, numeric digits and external command return codes need explicit checks.

## REXX — Focused mastery pathway

### Why this language behaves differently
REXX is a string-oriented scripting language with several implementations (such as z/OS REXX and Regina). The following procedure reads two positional arguments, checks the quantity **before** comparing it numerically and prints a stable one-line result. A successful interpreter run on one platform is not proof that all host commands are portable.

### Sample (check.rexx)
~~~rexx
/* check.rexx: no file or system changes */
parse arg item qty
if item = '' then do
  say 'missing item'
  exit 1
end
if datatype(qty, 'W') = 0 then do
  say 'quantity must be a whole number'
  exit 2
end
if qty < 0 then do
  say 'quantity cannot be negative'
  exit 3
end
say item':' qty
exit 0
~~~
For two arguments bolt 4, expect bolt: 4 (spacing is dialect/output-format dependent). Missing item and nonnumeric qty take different exit routes. DATATYPE with option W tests for whole-number format under the interpreter's numeric settings; it is not a range or authorization check.

### Investigations
1. Pass an empty item. Observe exit code 1 and verify no filesystem change occurred.
2. Pass qty=abc. DATATYPE must reject it before the comparison qty < 0, preventing a numeric-conversion error.
3. Pass -1. Numeric format is valid but the business rule rejects a negative quantity.
4. Try very large integers under different NUMERIC DIGITS settings; record precision effects instead of assuming fixed 64-bit integer arithmetic.
5. Compare argument parsing and return-code capture in your actual REXX implementation with the host-specific command used to launch it.

### What to submit
Include dialect, interpreter version, launch command and actual stdout/exit codes for all cases. Never copy a destructive z/OS or shell command into an exercise merely to make it more 'real'. Reference: https://www.ibm.com/docs/en/zos/3.1.0?topic=functions-datatype
