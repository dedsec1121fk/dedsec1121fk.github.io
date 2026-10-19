# sas — consolidated language guide

## SAS

### How the language behaves
SAS separates DATA-step row processing from PROC-based analysis and reporting; the processing step changes how observations flow.

### Source fragment to analyze
```text
data scores;
  input id score;
  datalines;
1 10
2 20
;
run;
proc means data=scores; var score; run;
```

### Deliberate exercise
Compute the mean manually and explain why the DATA step creates observations whereas PROC MEANS reads them.

### Check a failure condition
The automatic retention and missing-value rules of SAS DATA steps can surprise users from Python or SQL.

Record input, expected output and observed output with the actual SAS implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## SAS — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for SAS. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
data _null_;
  put 'Hello, Ada!';
run;
~~~

**Run context:** Execute in a licensed SAS environment.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Build a DATA step with numeric scores and use PROC MEANS SUM, N and NMISS. Compare missing numeric '.' with character missing values and inspect the SAS log.

### Boundary-case investigation
BY processing usually requires sorting first; implicit type coercions can silently alter a column's meaning.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to SAS. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.
