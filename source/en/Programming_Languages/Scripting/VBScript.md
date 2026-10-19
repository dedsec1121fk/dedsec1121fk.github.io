# vbscript — consolidated language guide

## VBScript

### Working model
VBScript is a Windows scripting technology common in legacy administration and classic ASP; current Windows security posture and availability can restrict it.

### Focused source example
```text
Dim total
total = 2 + 3
WScript.Echo total
```

On an authorized legacy host, distinguish execution through Windows Script Host from execution inside an ASP page.

### Evidence to collect
Record the exact VBScript compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Avoid telling users to enable deprecated scripting components merely for a tutorial; prefer modern supported automation.

## VBScript: applied exercises

### Use a Windows-specific fixture
VBScript historically runs under Windows Script Host; it is not portable to Termux or a Linux shell merely because it is text. In a disposable `squares.vbs`:

~~~vbscript
Option Explicit
Dim values, item
values = Array(1, 2, 3)
For Each item In values
    WScript.Echo item * item
Next
~~~

With a trusted Windows host, `cscript //nologo squares.vbs` should output 1, 4, 9. Use a current authorized VM or environment and record the host/version; VBScript support has changed on newer Windows editions. Do not assume the script can run just by typing `python squares.vbs`.

### Understand Variant and coercion
The `Array` elements and loop variable are Variants. Create a second array containing `"bad"` and deliberately attempt multiplication. Observe the actual type mismatch rather than assuming that arbitrary text is always converted into a number. Compare `IsNumeric` before conversion with calling `CInt`; specify what your input policy should do for a blank string.

### Failure visibility
Remove `Option Explicit` in a scratch copy and introduce a misspelled variable. Explain why implicit creation of identifiers can mask a typo. Keep `Option Explicit` in the corrected version. Avoid `On Error Resume Next` as a blanket solution: it can cause the code to continue after an unhandled failed operation, producing misleading output.

### Independent assignment
Read a small CSV-like fixture from a **temporary** text file and sum valid integer fields. Report invalid rows with their line numbers; do not modify user files or the registry. Test empty input, a negative integer, invalid text and repeated headers. Reference: https://learn.microsoft.com/previous-versions/windows/internet-explorer/ie-developer/scripting-articles/

## VBScript — Focused mastery pathway

### Inspect the language's real model
Use WScript.Arguments to read and validate a filename, then display a non-destructive report on whether it exists.

### Controlled failure and recovery
Compare IsEmpty, IsNull and a zero-length string. Handle file-system errors explicitly without a blanket On Error Resume Next over the whole script.

### Independent practical assignment
Write a small report using a disposable folder via FileSystemObject. Document why VBScript availability differs across Windows versions and why PowerShell is often preferable for new tools.
