# batch_cmd — consolidated language guide

## Batch CMD

### Mental model
Windows CMD batch files use percent expansion and command interpreter rules unlike Bash and PowerShell.

### Minimal source sample
```text
@echo off
set /a total=2+3
echo %total%
```

### Experiment to carry out
Run in a Windows CMD session and compare variable expansion inside a parenthesized block with expansion outside it.

### A specific failure to distinguish
Percent substitution inside blocks happens when the block is parsed; delayed expansion requires careful enablement and quoting.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Batch_CMD environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Batch_CMD — Expanded practice workbook

### Read the baseline source
~~~text
@echo off
set "NAME=Ada"
echo Hello, %NAME%!
~~~

**Relevant environment:** cmd /c hello.bat on Windows.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Build a read-only CMD script that checks a path via if exist and echoes a quoted argument. Test spaces, parentheses and delayed expansion inside a FOR block.

### The failure that must be understood
Percent expansion happens while a block is parsed; !var! requires careful delayed expansion and can corrupt filenames containing !.

## Batch_CMD — Focused mastery pathway

### Foundation exercise
Build a Windows CMD batch file that accepts a quoted path, checks IF EXIST and reports its presence without modifying it.

### Problem-solving exercise
Use a FOR loop and observe how percent expansion behaves inside parentheses. Compare with delayed expansion and test a filename containing an exclamation mark.

### Independent project
Write a batch inventory that counts known sample files and returns meaningful ERRORLEVEL values. Test paths with spaces, parentheses and Unicode where your code page permits.
