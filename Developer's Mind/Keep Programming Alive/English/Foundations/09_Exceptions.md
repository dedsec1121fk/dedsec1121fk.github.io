# Errors and exception handling

Handle only failures you can recover from. Keep meaningful error messages and avoid a catch-all that silently hides problems. Use finally or context managers for cleanup.

## Worked example

```text
text = "123"
try:
    value = int(text)
except ValueError:
    print("not a number")
else:
    print(value * 2)
```

## Practice

Try text="abc" and explain the new branch.

## Corrected result / hint

The ValueError branch reports invalid numeric text.

## Exceptions are part of the interface
Catch an exception only where you can make a useful decision. An absent optional file may trigger a default; a corrupt required configuration should fail clearly. Do not swallow all errors or silently replace malformed input with good-looking values.
```python
from pathlib import Path
def load_name(path):
    try: text=Path(path).read_text(encoding="utf-8")
    except FileNotFoundError: return "anonymous"
    if not text.strip(): raise ValueError("empty name file")
    return text.strip()
```
Differentiate `FileNotFoundError`, `PermissionError` and `UnicodeDecodeError`; they demand different repairs. Use `raise ... from exc` when translating a low-level failure into a domain-specific one. `finally` is for cleanup, not suppressing errors.

**Exercise:** test missing file, unreadable file where practical, empty file, invalid UTF-8 and valid file; assert that each produces the intended outcome.

## Distinguish parsing from application rules

~~~python
def parse_score(text):
    try:
        value = int(text)
    except ValueError as exc:
        raise ValueError("not an integer") from exc
    if value < 0:
        raise ValueError("negative score")
    return value

assert parse_score("0") == 0
assert parse_score("12") == 12
~~~

Test `"bad"` and `"-2"` separately. Both produce `ValueError`, but one originates in conversion and one in a documented domain constraint. Preserve the original cause when wrapping an exception. Returning zero in `except Exception` would silently turn corrupted input into a valid score. Extend this into file input: handle `FileNotFoundError` at the file operation, use a context manager for cleanup, and add `unittest.assertRaisesRegex` for each rejection. Record precisely which exception each boundary may recover from. Reference: https://docs.python.org/3/tutorial/errors.html
