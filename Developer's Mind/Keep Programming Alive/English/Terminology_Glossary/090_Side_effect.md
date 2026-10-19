# Side effect — separate decisions from observable changes

## Precise meaning
A side effect is a change observable outside a function's returned value: a file write, network request, log line, mutation of a shared object or system clock dependency. Pure calculations are easier to reproduce because their result depends only on their explicit arguments. Separating calculation from a side-effectful boundary lets tests inject a writer and verify failure without writing real files or relying on personal data.

## Runnable Python 3 lab
Save as side_lab.py and run python3 side_lab.py. A pure compute function produces integer-cent totals; render produces a deterministic JSON string. The publish function invokes a caller-supplied writer only after validation and rendering succeed. The test simulates both a bad input and a write failure.

~~~python
import json

def compute(entries):
    totals = {}
    for category, cents in entries:
        if not isinstance(category, str) or not category or type(cents) is not int or cents < 0:
            raise ValueError('invalid entry')
        totals[category] = totals.get(category, 0) + cents
    return totals

def render(entries):
    return json.dumps(compute(entries), ensure_ascii=False, sort_keys=True) + '\n'

def publish(entries, writer):
    payload = render(entries)  # Validate before invoking any side-effectful function.
    writer(payload)

out = []
publish([('βιβλία', 120), ('books', 30)], out.append)
assert out == ['{"books": 30, "βιβλία": 120}\n']
try:
    publish([('valid', 10), ('invalid', -1)], out.append)
except ValueError:
    pass
else:
    raise AssertionError('invalid input published')
assert len(out) == 1
try:
    publish([('books', 1)], lambda x: (_ for _ in ()).throw(OSError('disk unavailable')))
except OSError:
    pass
else:
    raise AssertionError('write failure hidden')
assert render([('βιβλία', 120), ('books', 30)]) == out[0]
print('PASS side effects: pure core, injected writer, errors')
~~~

## What the test does and does not guarantee
The first call appends one string to a test list, with Unicode category names preserved and keys sorted. Invalid input fails before the writer is invoked, leaving the list unchanged. A writer can still fail after partially writing bytes; this simple abstraction cannot guarantee atomic filesystem updates. For an actual report, use a temporary file, write and close it successfully, then replace the destination where atomic rename is supported. The pure compute function avoids modifying its input and uses integer cents rather than floating-point money.

## Targeted exercises
1. Add a shared global counter to compute and run the same test twice. Explain which purity guarantee was violated.
2. Inject a writer that records only the first three bytes before raising OSError. Decide which layer must implement atomic replacement.
3. Add a category containing a comma or Greek text; verify UTF-8 rendering and deterministic sorting without real I/O.
4. Test a negative count and a boolean masquerading as an integer. Show that the writer receives no content after a validation failure.

**Evidence:** PASS output, one stable JSON record, a failed-input test that leaves state intact and a documented limitation of partial writer failures.
