# Input security — refuse archive traversal and encode HTML output

## Scenario and acceptance criteria
When previewing an archive, accept only portable relative POSIX paths made of nonempty components. Reject absolute paths, parent traversal, backslashes, drive syntax and ambiguous empty or dot components before any extraction. Separately, if showing user-supplied labels as HTML text, escape the output for the HTML context. Path validation and HTML output escaping are different operations.

## Executable lab
Save as `14_security.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
from pathlib import PurePosixPath
from html import escape
def safe_member(name):
    if not isinstance(name, str) or not name or "\\ " in name:
        raise ValueError("invalid member")
    if "\\" in name or ":" in name or name.startswith("/"):
        raise ValueError("nonportable or absolute path")
    parts = name.split("/")
    if any(part in ("", ".", "..") for part in parts):
        raise ValueError("unsafe component")
    result = PurePosixPath(name)
    if result.is_absolute():
        raise ValueError("absolute path")
    return result
assert str(safe_member("docs/ελληνικά.md")) == "docs/ελληνικά.md"
assert escape('<script>alert(1)</script>') == '&lt;script&gt;alert(1)&lt;/script&gt;'
for bad in ("../secret", "docs/../../x", "/etc/passwd",
            "C:\\Users\\item", "docs//x", "docs/./x"):
    try: safe_member(bad)
    except ValueError: pass
    else: raise AssertionError("unsafe archive path accepted")
print("PASS archive-path and HTML context boundaries")
~~~

## Technical interpretation
PurePosixPath normalizes some components, so inspecting the raw string before converting is essential: normalization alone can hide `..`, `//` or `./` patterns. A lexical path check does not secure actual archive extraction on its own. Real extractors must additionally reject symbolic and hard links, control directory creation under a trusted root, handle races and enforce size and entry-count limits. `html.escape` encodes characters important in HTML text; it is not SQL binding, a shell sanitizer or JavaScript string escaping.

## Bounded experiments
Test each traversal fixture and confirm that a valid Greek filename is permitted. Add percent-encoded path text and decide explicitly whether it is decoded at the boundary before checking. Compare placing `html.escape` output inside text content versus a JavaScript source literal, where different encoding is required. Extend the threat model to compressed-archive bombs and file-type spoofing.

## Diagnostics
If a path looks safe after normalization but was rejected, inspect its raw components first. Do not “repair” malicious entries by stripping leading `../`, because different malicious names may collapse onto the same output. When rendering unsafe text, choose the correct contextual encoding rather than a global replace function.
