# Deterministic failure injection and recovery assertions

## Mechanism and contract

A retry test should not need a real outage, random sleeps or a public endpoint. Pass the operation as a dependency and make a fixture fail at a named step. The test can then distinguish retryable transport interruption from permanent validation errors. Catching every exception and retrying can hide programming mistakes and multiply side effects.

Assert both the returned result and the number of calls. A test that eventually gets the right value can still conceal excessive requests or duplicate writes. Use a small fixed attempt limit for the fixture, and a separately tested monotonic budget in real clients. Injected failures make a specific control path reproducible; they do not replace integration testing against the real dependency's error contracts.

## Worked local example

```python
from unittest.mock import Mock

def retry_read(read, attempts=3):
    for n in range(attempts):
        try:
            return read()
        except TimeoutError:
            if n + 1 == attempts:
                raise
read = Mock(side_effect=[TimeoutError("fixture"), "result"])
assert retry_read(read) == "result" and read.call_count == 2
bad = Mock(side_effect=ValueError("invalid payload"))
try:
    retry_read(bad)
except ValueError:
    pass
assert bad.call_count == 1
print("temporary and permanent failures separated")
```

## Failure checks and limits

Add exhaustion, success on the first call and a cancelled operation. Confirm that a permanent failure stops immediately. A write operation additionally needs an idempotency contract before retry is safe. Keep generated fake error messages independent of localization so the test checks error types and state transitions rather than fragile matching of human-readable text.

## Primary reference

[Official documentation](https://docs.python.org/3/library/unittest.mock.html#unittest.mock.Mock)
