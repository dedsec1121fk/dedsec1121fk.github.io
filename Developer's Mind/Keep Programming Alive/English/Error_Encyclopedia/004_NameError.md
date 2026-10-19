# Python names, type mismatches and missing dictionary keys

## NameError

### What fails and when
NameError means a referenced name is not defined in the scope being executed. It can result from a spelling error, a conditional assignment that never ran, using a name before initialization, or importing from a different module than expected. A locally assigned name used too early inside a function may instead produce UnboundLocalError.

### Self-contained executable example
Save this as 004_NameError.py and run `python3 004_NameError.py`. The example checks both the error and a valid case.

~~~python
def discount(price, eligible):
    amount = price
    if eligible:
        amount = price * 0.9
    return amount
assert discount(100, True) == 90
assert discount(100, False) == 100
try:
    eval("ammount", {})
except NameError as exc:
    assert "ammount" in str(exc)
else:
    raise AssertionError("misspelling was not caught")
~~~

### Diagnostic sequence and safe repair
Start with the exact spelling in the traceback and the surrounding function scope; compare it to the assignment or import. Trace conditional branches with the failing input. Do not inject arbitrary values into globals() as a workaround; initialize explicitly or return a value from a function. In notebooks, rerun from a clean kernel to reveal hidden cell-order dependencies.

### Practical lab and boundary test
Introduce a branch where amount is only assigned when eligible is true. Find the false-input failure, restore unconditional initialization, and write two tests. Then compare NameError with UnboundLocalError using a function that reads x before x = 1.

## TypeError

### What fails and when
A TypeError occurs when an operation or call receives objects it cannot use: adding str to int, calling a non-callable value, passing an unsupported keyword or omitting a required argument. Before converting types, decide whether the caller or the API contract is wrong. Automatic coercion can hide a broken data boundary.

### Self-contained executable example
Save this as 006_TypeError.py and run `python3 006_TypeError.py`. The example checks both the error and a valid case.

~~~python
def total_cost(price, quantity):
    if not isinstance(price, (int, float)):
        raise TypeError("price must be numeric")
    if type(quantity) is not int:
        raise TypeError("quantity must be an integer")
    return price * quantity
assert total_cost(2.5, 3) == 7.5
try:
    total_cost("2.5", 3)
except TypeError as exc:
    assert "numeric" in str(exc)
else:
    raise AssertionError("invalid type accepted")
~~~

### Diagnostic sequence and safe repair
Inspect type(value), repr(value), the full function signature and the first failing frame you own. Distinguish text obtained from input() or JSON from numbers. Validate at the boundary; convert with explicit error handling only when the input format permits it. Note that bool is a subclass of int: use type(x) is int where True must not count as one unit.

### Practical lab and boundary test
Extend the contract to reject negative quantities and non-finite prices. Should the failures be TypeError or ValueError? Document the distinction and assert the exact exception class, including a True quantity and a NaN price.

## KeyError

### What fails and when
Dictionary subscripting raises KeyError when the requested key is missing. Whether to catch it depends on the schema: an absent optional display name may have a safe default, whereas a missing transaction ID is a data-integrity fault. Blindly replacing every lookup with get() makes corrupted inputs look valid.

### Self-contained executable example
Save this as 008_KeyError.py and run `python3 008_KeyError.py`. The example checks both the error and a valid case.

~~~python
def label(record):
    order_id = record["id"]  # required
    nickname = record.get("nickname")
    return f"{order_id}: {nickname or 'Guest'}"
assert label({"id": 7}) == "7: Guest"
assert label({"id": 7, "nickname": "Ada"}) == "7: Ada"
try:
    label({"nickname": "Ada"})
except KeyError as exc:
    assert exc.args == ("id",)
else:
    raise AssertionError("required key was optional")
~~~

### Diagnostic sequence and safe repair
Print or log sorted(record.keys()) for non-sensitive test data, not complete production payloads. Compare the expected schema with actual parser output. Membership checks are appropriate when None is a valid stored value; dict.get cannot distinguish a missing key from an explicitly stored None without a sentinel.

### Practical lab and boundary test
Create a sentinel = object() and tell apart absent nickname, nickname=None and nickname=''. Define a user-visible policy for each, while keeping id mandatory; test the three boundaries.
