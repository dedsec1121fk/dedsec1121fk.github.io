# Debugging casebook — Python and JavaScript pitfalls

## Python: mutable default argument

### Broken example — DO NOT USE

```text
def add(item, items=[]):
    items.append(item)
    return items
```

### Fixed example

```text
def add(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### Why it fails and the repair works

A default list is created once and shared across calls.

Check the surrounding imports, function signature and environment: fragments may require integration before execution.

### Root cause and precise failure
A list used as a default is allocated when the function is defined, so separate no-argument calls share the same list. The fixed function allocates fresh storage unless a caller explicitly passes a collection.

### Repeatable regression exercise
Call the broken function with 'Ada' and then 'Grace'. Show that the second result unexpectedly includes both. Call the fixed function twice and require independent outputs, then supply a shared list explicitly to demonstrate intentional sharing.

**Acceptance rule:** preserve the original failure as a test, verify the corrected version on both the ordinary case and the boundary case, and avoid modifying real user data.

## Python: missing file encoding

### Broken example — DO NOT USE

```text
text = open("notes.txt").read()
```

### Fixed example

```text
from pathlib import Path
text = Path("notes.txt").read_text(encoding="utf-8")
```

### Why it fails and the repair works

Use explicit UTF-8 to handle Greek filenames/content consistently.

### Root cause and precise failure
Text files contain bytes, not an intrinsic Python string encoding. Choosing a mismatched codec corrupts or rejects characters; suppressing Unicode errors with ignore irreversibly drops information.

### Repeatable regression exercise
Write 'Καλημέρα' to a disposable UTF-8 file, reopen with encoding='utf-8' and compare bytes with code-point counts. Deliberately decode an invalid byte fixture and inspect UnicodeDecodeError without changing the original file.

## Python: swallowed exceptions

### Broken example — DO NOT USE

```text
try:
    work()
except Exception:
    pass
```

### Fixed example

```text
try:
    work()
except ValueError as exc:
    print(f"Invalid value: {exc}")
```

### Why it fails and the repair works

Catch only anticipated errors and report them.

### Root cause and precise failure
A blanket except that returns an empty result can make a failed operation look successful. Error recovery belongs at a layer that knows whether retry, user explanation or abort is appropriate.

### Repeatable regression exercise
Trigger ValueError in a parser and FileNotFoundError at the file-reading boundary. Confirm only expected errors are translated into user-facing messages; an unexpected programming error must remain visible in tests.

## JavaScript: equality confusion

### Broken example — DO NOT USE

```text
if (count = 3) console.log("three");
```

### Fixed example

```text
if (count === 3) console.log("three");
```

### Why it fails and the repair works

Assignment is not comparison; prefer strict equality.

### Root cause and precise failure
Loose equality performs type conversion: the string '0' can compare equal to the numeric zero. Strict equality preserves the distinction, but runtime input conversion still needs its own validation.

### Repeatable regression exercise
Compare the pairs ('0',0), (false,0) and (null,undefined) with == and ===. Refactor the application to convert the intended input type before comparison instead of depending on coercion.
