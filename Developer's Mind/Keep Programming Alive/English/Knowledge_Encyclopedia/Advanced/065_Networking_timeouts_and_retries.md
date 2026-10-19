# Networking failures — bounded retries and idempotent writes

## Failure model
A timeout tells the client that it did not receive an answer; it does not prove the remote server performed no work. A POST that committed just before its reply was lost must not create a second charge during retry. Distinguish permanent bad requests (400 or 401) from potentially transient 429 and 503 responses. A real client must also respect Retry-After when valid, a total deadline, connection and read timeouts, and a maximum number of attempts.

## Executable failure simulation (Python 3)
Save as retry_lab.py and run python3 retry_lab.py. The transport is simulated; no HTTP request, financial transaction or network access takes place. A response is deliberately lost after the first logical write.

~~~python
def plan(statuses, max_attempts=3):
    visits = []
    for status in statuses[:max_attempts]:
        visits.append(status)
        if status == 200:
            return ("OK", visits)
        if status not in (429, 503):
            raise ValueError("permanent HTTP failure")
    raise TimeoutError("attempt budget exhausted")

assert plan([503, 429, 200]) == ("OK", [503, 429, 200])
for bad in ([400, 200], [503, 503, 503]):
    try:
        plan(bad)
    except (ValueError, TimeoutError):
        pass
    else:
        raise AssertionError("bad retry accepted")

ledger = {}
def post(key, fail_response=False):
    if not key:
        raise ValueError("idempotency key required")
    if key not in ledger:
        ledger[key] = len(ledger) + 1
    if fail_response:
        raise TimeoutError("reply lost after commit")
    return ledger[key]

try:
    post("order-7", True)
except TimeoutError:
    pass
else:
    raise AssertionError("missing simulated timeout")
assert post("order-7") == 1 and len(ledger) == 1
print("PASS: bounded retries and no double commit")
~~~

## Why retry safety is not just a loop
The plan stops immediately on a permanent response and throws after the attempt budget. The ledger uses a stable idempotency key: two attempts with order-7 refer to the same operation and return the same ID. Real servers must persist idempotency keys and their results atomically with the side effect; a local dictionary cannot do this across restarts. A server that rejects or forgets keys after a TTL needs an explicitly documented retry window. GET is generally intended to be safe/idempotent, but intermediaries and poorly designed endpoints can violate assumptions.

## Exercises and diagnostics
1. Change statuses to [503, 400, 200]; only two attempts should occur and the permanent error should propagate.
2. Make the server fail after committing twice without a stable idempotency key. Show the duplicate, then restore the key and verify one logical write.
3. Add a capped exponential delay schedule and deterministic jitter generated from a seeded random source. Test only calculation, never use real sleeps in unit tests.
4. Design the clock budget: a 2-second total deadline and a per-attempt timeout must leave time for at least one response. Explain why unlimited backoff violates this guarantee.

**Completion proof:** PASS, an explicit 429/503/400 policy, a lost-response trace, and a note identifying durable idempotency as a server requirement. The simulation does not establish reliability of a real provider.
