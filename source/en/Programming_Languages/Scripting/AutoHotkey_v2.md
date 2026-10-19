# autohotkey_v2 — consolidated language guide

## AutoHotkey v2

### Operational idea
AutoHotkey v2 automates desktop input on Windows and uses expression syntax that differs considerably from v1.

### Source or deliberately marked concept
```text
#Requires AutoHotkey v2.0
MsgBox(2 + 3)
```

### Apply it to one controlled task
Test a harmless hotkey that shows a message and compare v1 command syntax with v2 function calls.

### Check the important boundary
UI automation should not target password fields or unapproved applications; keyboard focus can change unexpectedly.

Work with disposable data in a genuine implementation of AutoHotkey_v2 where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## AutoHotkey_v2 — Expanded practice workbook

### Read the baseline source
~~~text
name := "Ada"
MsgBox("Hello, " name "!")
~~~

**Relevant environment:** Run with AutoHotkey version 2 on Windows.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Write a hotkey that toggles a visible state rather than sending global keystrokes. Test two rapid presses and explain v2 function-call syntax versus v1 command syntax.

### The failure that must be understood
AutoHotkey v2 deliberately breaks some v1 conventions. Input interception and accessibility depend on Windows privileges and active window.

## AutoHotkey_v2 — Focused mastery pathway

### Foundation exercise
Write an AutoHotkey v2 hotkey that toggles a small on-screen status message, without sending keystrokes to unrelated applications.

### Problem-solving exercise
Test double key presses and hotkey scope when the target application is not focused. Distinguish functions and expression syntax in v2 from v1 command-based examples.

### Independent project
Create an opt-in keyboard shortcut that inserts a harmless sample into a scratch text editor. Implement an explicit disable hotkey and check for key conflicts.
