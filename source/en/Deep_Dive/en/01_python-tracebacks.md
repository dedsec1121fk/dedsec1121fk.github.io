# Reading Python tracebacks

## What is happening
A traceback is a chain of function calls. Read the last exception line first, then work upward until you find the earliest frame belonging to your own code.

## Practical investigation
Record the exact exception class, the bad value and the file/line. Write the smallest fixture that reproduces it before editing.

## Common traps
For KeyError, check a dictionary's available keys and where the missing key originated; do not suppress all exceptions with bare except.

## Adaptable demonstration
```text
python -X dev script.py
```

## Completion check
Repeat the observation on your own test system with harmless fixtures. Confirm that the fix did not delete previous work.

## Trace the value across a call boundary
~~~python
def load_price(record):
    return int(record['price'])

try:
    load_price({'price': 'unknown'})
except ValueError as exc:
    assert type(exc).__name__ == 'ValueError'
else:
    raise AssertionError('invalid numeric text accepted')
~~~
First predict whether the failure comes from dictionary lookup or integer conversion. Change only the fixture to `{}`: the exception becomes KeyError, because conversion is never reached. A repair that catches ValueError cannot fix a missing field. Decide whether each input violates the caller's contract or is an expected rejected record, then handle it at that boundary. Do not include complete customer records in a diagnostic merely to identify one field.

For a chained exception, inspect both the final message and its explicit cause. An exception wrapped with `raise ... from exc` preserves useful context; replacing it with an unrelated success value makes downstream errors harder to attribute. A test should assert the intended outcome, not exact traceback line numbers that change when the file is edited.
