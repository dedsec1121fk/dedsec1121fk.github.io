# Reading code: types, aliasing and mutable state

## Reading an unfamiliar codebase

### Core explanation
Read the invocation before editing implementations. Identify entry point, command-line arguments, configuration source, imports, caller graph, actual output, and the test suite. Reading every file alphabetically tells you far less than tracing one concrete input end-to-end. A function name is a hypothesis about behavior, not evidence.

### Runnable example
~~~python
def price_after_discount(cents: int, discount: int) -> int:
    if not 0 <= discount <= 100:
        raise ValueError("invalid discount")
    return cents * (100 - discount) // 100

def main():
    print(price_after_discount(1999, 10))

if __name__ == "__main__":
    main()
~~~

### Interpret the results
Run `python app.py` after saving the snippet as app.py: the output is 1799 integer cents, rounded down. Trace main → price_after_discount → input check → arithmetic → print. Merely importing app does not print because its `__name__` guard protects main. Write down these observations before guessing which other files matter.

### Independent practical lab
Create a trace table with columns input, responsible function, transformation, output. Predict and test discount 0, 100 and -1. Identify the missing contract for negative `cents` separately from discount validation. In a real repo, determine whether the file is generated, vendored, tested or maintained by the project before changing it. Preserve a minimal repro and rerun affected tests.

**Reference:** https://docs.python.org/3/library/__main__.html

## Types and conversions

### Core explanation
A conversion that succeeds syntactically may still violate a business rule. Python `int(3.9)` truncates rather than rounds, and `bool` is a subclass of `int`. A text field containing digits still needs grammar and range validation before it becomes a safe value for arithmetic, persistence or permissions.

### Runnable example
~~~python
def parse_quantity(value: object) -> int:
    if not isinstance(value, str):
        raise TypeError("expected text")
    if not value.isascii() or not value.isdecimal():
        raise ValueError("ASCII digits only")
    number = int(value)
    if number > 500:
        raise ValueError("range 0..500")
    return number

assert parse_quantity("004") == 4
for invalid in ("-1", "3.5", "٥", "501"):
    try:
        parse_quantity(invalid)
    except ValueError:
        pass
    else:
        raise AssertionError(invalid)
~~~

### Interpret the results
The accepted grammar allows leading zeros but rejects signs, decimals, non-ASCII numeral symbols, and values above 500. `isdecimal()` alone would also recognize certain Unicode numeral characters; `isascii()` explicitly limits this input protocol to ASCII digits. An empty string is rejected because `isdecimal()` is false.

### Independent practical lab
Extend the function to reject leading zeros except the literal '0'. Test whitespace, True, None, 500, 501 and a 100,000-digit string. Introduce a maximum input length before integer conversion to bound resource consumption. Do not replace every exception with a default zero: invalid text, missing values and a legitimate zero must remain distinguishable.

**Reference:** https://docs.python.org/3/library/stdtypes.html#str.isdecimal

## Mutable state and aliasing

### Core explanation
Two variable names can refer to the same mutable object. Copying an outer list does not necessarily copy dictionaries or lists nested within it; a modification through one reference can change another apparently separate view. Rebinding a name is different from mutating the shared object.

### Runnable example
~~~python
from copy import deepcopy
original = [{"name": "Ada", "scores": [8]}]
shallow = original.copy()
shallow[0]["scores"].append(9)
assert original[0]["scores"] == [8, 9]

isolated = deepcopy(original)
isolated[0]["scores"].append(10)
assert original[0]["scores"] == [8, 9]
assert isolated[0]["scores"] == [8, 9, 10]
~~~

### Interpret the results
The first `copy()` duplicates only the outer list; its elements still refer to the original dictionary and nested scores list. `deepcopy` recursively copies these ordinary containers, so later changes to the isolated copy do not change the source. Deep copying sockets, locks or resource-owning objects is a different problem and may not be valid.

### Independent practical lab
Draw an object graph with arrows from original, shallow and isolated to their inner structures. Rebind shallow[0] to an entirely new dictionary and check if original changes. Next design a function accepting read-only input and returning a new value instead of mutating its parameter. Compare memory cost and behavioral isolation explicitly.

**Reference:** https://docs.python.org/3/library/copy.html
