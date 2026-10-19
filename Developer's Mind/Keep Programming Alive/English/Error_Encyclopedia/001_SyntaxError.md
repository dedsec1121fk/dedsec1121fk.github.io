# Python syntax, indentation and mixed-tabs diagnostics

## SyntaxError

### What fails and when
A SyntaxError means Python could not parse source into a program. The indicated line is where parsing failed, not always where the mistake began. Missing closing delimiters, colons, malformed f-strings and invalid assignment targets can shift the reported location. Separate parser errors from NameError or TypeError: the latter happen only after the file parses.

### Self-contained executable example
Save this as 001_SyntaxError.py and run `python3 001_SyntaxError.py`. The example checks both the error and a valid case.

~~~python
bad = "total = (10 +\n 20\nprint(total)"
try:
    compile(bad, "<lesson>", "exec")
except SyntaxError as exc:
    print(type(exc).__name__, exc.lineno)
    assert exc.lineno is not None
else:
    raise AssertionError("invalid source parsed")
good = "total = (10 + 20)\nprint(total)"
exec(compile(good, "<lesson>", "exec"))  # 30
~~~

### Diagnostic sequence and safe repair
Use python3 -m py_compile file.py for a syntax-only check before running side effects. Examine the offending line and preceding delimiter stack. On generated code, print repr(source) to reveal hidden newlines; do not fix by blindly deleting punctuation. The deliberately invalid sample is contained in a string, so the surrounding test remains executable.

### Practical lab and boundary test
Change the invalid source to omit a colon after an if statement. Record exc.msg, exc.lineno and exc.offset; then repair it. A regression test should assert compilation succeeds, not only that the text contains a colon.

## IndentationError

### What fails and when
Indentation is part of Python's grammar. An unexpected indent adds a block where none is permitted; an expected-indented-block error means a compound statement has no suite. The fix depends on the logical structure, not on automatically adding four spaces to every line.

### Self-contained executable example
Save this as 002_IndentationError.py and run `python3 002_IndentationError.py`. The example checks both the error and a valid case.

~~~python
broken = "def total(values):\nreturn sum(values)"
try:
    compile(broken, "<indent-case>", "exec")
except IndentationError as exc:
    print(type(exc).__name__, exc.lineno)
else:
    raise AssertionError("bad indentation accepted")
def total(values):
    if not values:
        return 0
    return sum(values)
assert total([2, 3]) == 5
assert total([]) == 0
~~~

### Diagnostic sequence and safe repair
In the editor, display whitespace characters and inspect the whole surrounding if/else, try/except or def suite. A visually aligned line can still carry tabs. Run python3 -m tabnanny path/to/package to detect ambiguous indentation, then format a small reviewed scope. Avoid replacing all whitespace in generated code without diff review.

### Practical lab and boundary test
Add an else branch that returns -1 for negative-only input. Intentionally unindent its body, capture the compile failure, then assert all three cases. Explain why a pass statement is syntactically valid but not a substitute for intended behavior.

## TabError

### Why this error is different
A file can appear aligned while its indentation uses different characters. Python expands tabs using tab stops, and a mixture can make the block structure depend on interpretation. TabError is a subclass of IndentationError, but it specifically flags inconsistent use of tabs and spaces.

### Reproduce safely
Create broken.py with the following shell commands; the second line of the function begins with a literal tab:

~~~sh
printf 'def greet():\n\tprint("hello")\n    print("again")\ngreet()\n' > broken.py
python -m py_compile broken.py
~~~

Expect TabError: inconsistent use of tabs and spaces in indentation. Use sed -n 'l' broken.py on systems with sed to expose the tab as \t; alternatively inspect repr(open("broken.py").read()) in Python.

### Repair and verification
~~~python
def greet():
    print("hello")
    print("again")

greet()
~~~

Run python -m py_compile fixed.py and python fixed.py. The output is two lines. Change indentation only in the affected block, keeping intended nesting. An editor's "convert indentation to spaces" command is useful after you inspect the diff, but blind replacement can alter nested control flow.

### Lab
Insert a tab before one nested statement and spaces before another. Compare editor display at tab widths 4 and 8. Add a pre-commit check with python -m tabnanny for source directories, and configure the editor to insert spaces when Tab is pressed. Note that a tab in a string literal is data, not indentation: do not globally delete every tab from all files.
