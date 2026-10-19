# vba — consolidated language guide

## VBA

### Mental model
VBA automates Office-host objects; the workbook/document object model is available only within an appropriate host.

### Minimal source sample
```text
Sub Demo()
    Dim value As Integer
    value = 2 + 3
    Debug.Print value
End Sub
```

### Experiment to carry out
Distinguish procedure-local variables from Range or Worksheet objects and test on an empty disposable workbook.

### A specific failure to distinguish
Never enable unknown macros for a lesson; signed/trusted policy and Office platform differences are security boundaries.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible VBA environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## VBA — Expanded practice workbook

### Read the baseline source
~~~text
Sub Greet()
    Debug.Print "Hello, Ada!"
End Sub
~~~

**Relevant environment:** Import into an Office VBA editor; run the macro.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Write a macro that reads values from a test worksheet without modifying cells and counts invalid numbers. Enable Option Explicit and restore application settings on errors.

### The failure that must be understood
Worksheet formulas, Empty, Null and Excel dates can coerce differently. Never run untrusted macros; trust center and permissions are deliberate security boundaries.

## VBA — Focused mastery pathway

### Inspect the language's real model
Write an Excel VBA macro that reads values from a disposable worksheet without modifying cells. Enable Option Explicit and use explicit variable types.

### Controlled failure and recovery
Classify missing, Empty, Null and numeric values in separate branches; prove that an Excel date serial is not automatically a user-entered quantity.

### Independent practical assignment
Create a report on a new temporary workbook only after confirmation, restoring ScreenUpdating and other application state through a cleanup path after errors.
