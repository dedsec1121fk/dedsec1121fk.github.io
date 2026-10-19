# Programming foundations: modules and reproducible debugging

## Foundations index

01. What is a program? — `01_What_is_a_program.md`
02. Variables and types — `02_Variables_and_types.md`
03. Conditional logic — `03_Conditions.md`
04. Loops and iteration — `04_Loops.md`
05. Functions and parameters — `05_Functions.md`
06. Lists, maps and sets — `06_Collections.md`
07. Strings and Unicode — `07_Strings_and_unicode.md`
08. Files and paths — `08_Files_and_paths.md`
09. Errors and exception handling — `09_Exceptions.md`
10. Modules, packages and imports — `10_Modules.md`
11. Algorithms and complexity — `11_Algorithms.md`
12. Queues, stacks and indexes — `12_Data_structures.md`
13. Unit tests and regression checks — `13_Unit_testing.md`
14. Reproducible debugging — `14_Debugging.md`
15. Git and safe change history — `15_Git.md`
16. Environments and reproducible builds — `16_Environment.md`
17. HTTP, JSON and API boundaries — `17_APIs.md`
18. Secure defaults and user consent — `18_Security.md`
19. Cross-platform and accessibility — `19_Portability.md`
20. Release checklist and documentation — `20_Release.md`

## Modules, packages and imports

Split large code into cohesive modules with explicit public interfaces. Avoid importing a script that executes installations or prompts at module import time. Keep a main guard for runnable code.

### Worked example

```text
def main():
    print("starting")

if __name__ == "__main__":
    main()
```

### Practice

Explain what happens when another module imports this file.

### Corrected result / hint

Functions are defined but main() is not auto-called.

### Track which Python module was imported

~~~python
import importlib.util
spec = importlib.util.find_spec("json")
print(spec.origin if spec else "missing")
~~~

Run this from a fresh disposable directory. Now create a local file named `json.py` in that same directory and start a **new interpreter**. The import may resolve to your local file rather than the standard library. An eventual `AttributeError` when calling `json.loads` is a symptom of shadowing; inspecting `json.__file__` identifies the actual origin. Rename the local file and verify resolution again. In another scratch module, put a printing statement under `if __name__ == "__main__":`, import the module, and explain why other top-level assignments can still run. Independently compare imports from two working directories and capture `sys.executable` and `sys.path`. Reference: https://docs.python.org/3/tutorial/modules.html

## Reproducible debugging

Record the expected result, actual result, exact command, platform, and smallest example that reproduces the problem. Change one thing at a time. Log context but never print secrets or personal data.

### Worked example

```text
def divide(a, b):
    if b == 0:
        raise ValueError("b must be nonzero")
    return a / b
print(divide(6, 2))
```

### Practice

Write a bug report for divide(6, 0).

### Corrected result / hint

Expected: controlled error; actual: ValueError with clear message.

### Reduce a failure to the smallest counterexample

~~~python
def clean_name(value):
    result = value.strip()
    if not result:
        raise ValueError("empty")
    return result
assert clean_name(" Ada ") == "Ada"
~~~

Calling `clean_name(None)` fails before checking the empty-name rule. Add `isinstance(value, str)` **before** `strip`, raise a meaningful `TypeError`, and preserve a regression test. A different mistake is checking `if not value` before stripping: whitespace-only input then bypasses validation. Reproduce each defect separately with its smallest input. Record environment, stack trace, expected/actual result and the specific changed line. Never confuse suppressing an exception with repairing its root cause; avoid logging secrets and personal records while investigating. Reference: https://docs.python.org/3/library/pdb.html
