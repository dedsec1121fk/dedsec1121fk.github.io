# nushell — consolidated language guide

## Nushell

**Category:** Scripting. **Extension:** `.nu`. **Run:** `nu lesson.nu` with Nushell installed.

Nushell pipes structured values between commands. A list of integers remains a list rather than becoming whitespace-separated text. This matters when names, paths or records contain spaces.

### Reproducible calculation

Save the following as `lesson.nu`:

~~~nu
let values = [2 4 6]
let doubled = ($values | each {|n| $n * 2 })
print ($doubled | math sum)
~~~

Run `nu lesson.nu`. Expected output: `24`. `each` transforms each integer, while `math sum` aggregates the resulting list. The parentheses pass the complete pipeline result to `print`.

### Debug the type, not the formatting

In the interactive shell, run `[2 4 6] | describe` and `help each`. Replace the list with `["2" "4"]` and investigate the type mismatch before adding conversions. Do not parse a human-formatted table from an external command when a structured alternative exists.

### Exercise and edge cases

Create records with fields `name` and `points`. Filter records with `points >= 5` and count them. Repeat with an empty list, one record and a record with a missing field. Explain which input should be rejected rather than silently defaulted.

### Platform troubleshooting

Verify `nu --version` before executing scripts. Windows and Linux builds exist; Termux support depends on available packages and CPU architecture. A missing executable usually indicates installation or `PATH`, while a syntax error can mean POSIX-shell syntax was copied into Nushell. Quote paths containing spaces and test any file-modifying pipeline in a temporary directory first.

## NuShell: applied exercises

### Reproduce the starter's computation
`00_starter.nu` takes a list of integers, doubles each using `each`, and passes the results to `print`. Start with the purely numeric case `[1 2 3] | each {|n| $n * 2 }`. Predict the three values 2, 4 and 6 before running. Inspect the pipeline value and avoid assuming it is one unstructured string; Nushell processes typed values. You can inspect a value's type using `describe`.

### Work with a finite table
In a scratch Nushell session create this literal table and query it:

~~~nu
let jobs = [[name size]; [alpha 4] [beta 9] [gamma 12]]
$jobs | where size > 5 | get name
~~~

The expected name values are `beta` and `gamma`. The semicolon separates column headers from rows. The `where` stage retains records with size above five; `get name` extracts a list of cell values rather than preserving the whole table. Compare with `select name`, which keeps tabular records. Record the Nushell version, the `describe` result and the visible values. This recipe has not been run in the connected shell.

### A safe failed lookup
Try `$jobs | get nonexistent` and capture the actual cell-path error. This is structurally different from a table that **has** a `name` column but no matching rows. Also create a row with a string in the size column and observe what the comparison operator does under the installed version; do not claim every Nushell release silently coerces strings to integers.

### Extending the pipeline
Add a `delta` row with size 5 and verify that the strict `> 5` excludes it while `>= 5` includes it. Next sort by size and explain whether the projected names preserve the same ordering. If you process file metadata with `ls`, limit the exercise to a disposable directory: real path names or permission errors introduce unrelated variables.

### Completion evidence
Submit the starter result, typed table result, the failing column lookup and a boundary test at size 5. Explain the distinctions among list, table and record, and why errors in a command pipeline deserve capture rather than being hidden by a generic fallback. Reference: https://www.nushell.sh/book/

## NuShell — Focused mastery pathway

### Foundation exercise
Create a Nushell table from a test CSV and inspect typed columns rather than converting every row to an unstructured string.

### Problem-solving exercise
Use where, select and group-by to summarize rows; verify the output schema and observe how null fields differ from empty strings.

### Independent project
Build a read-only inventory pipeline for one temporary directory and export results to JSON. Compare pipeline errors with a legitimate empty table; avoid assuming Bash syntax.
