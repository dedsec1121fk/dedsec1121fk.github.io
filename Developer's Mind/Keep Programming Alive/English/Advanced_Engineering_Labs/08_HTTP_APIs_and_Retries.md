# HTTP response validation — bounded, idempotent retries

## Scenario and acceptance contract
An offline-capable application synchronizes a read-only catalog when networking is available. Retrying a GET after a temporary 429 or 503 may be acceptable; blindly retrying a POST that creates purchases or accounts may cause duplicate side effects. The example injects a transport function, so tests simulate HTTP statuses without making external requests. Restrict paths to known relative API endpoints, cap the number of attempts and validate the response schema even when the HTTP status is 200.

## Runnable Python 3 test double
Save as retry_lab.py and run python3 retry_lab.py. Simulated responses produce 503, then 429, then 200. Separate fixtures reject authorization errors, exhausted retry budgets, invalid JSON structure and hostile path strings.

~~~python
import re

def fetch_json(send, path, attempts=3):
    if not re.fullmatch(r'/api/[a-z-]{1,30}', path):
        raise ValueError('invalid API path')
    if type(attempts) is not int or not 1 <= attempts <= 5:
        raise ValueError('invalid retry budget')
    for number in range(1, attempts + 1):
        status, value = send('GET', path)
        if status == 200:
            if not isinstance(value, dict) or not isinstance(value.get('items'), list):
                raise ValueError('invalid response schema')
            return value['items']
        if status not in (429, 503) or number == attempts:
            raise RuntimeError(f'HTTP {status} after {number} attempt(s)')
    raise AssertionError('unreachable')

def transport(statuses):
    received = iter(statuses)
    calls = []
    def send(method, path):
        calls.append((method, path))
        return next(received)
    return send, calls

send, calls = transport([(503, None), (429, None), (200, {'items': [1, 2]})])
assert fetch_json(send, '/api/items') == [1, 2] and len(calls) == 3
for statuses in ([(401, None)], [(503, None)] * 3, [(200, {'item': 1})]):
    send, calls = transport(statuses)
    try: fetch_json(send, '/api/items')
    except (ValueError, RuntimeError): pass
    else: raise AssertionError('bad response accepted')
for path in ('https://example.com/', '/api/../admin', '/api/items?token=secret'):
    try: fetch_json(lambda *_: None, path)
    except ValueError: pass
    else: raise AssertionError('bad path accepted')
print('PASS HTTP: retry budget, auth stop, schema, path validation')
~~~

## Interpreting policy and missing production behavior
The transport receives only GET and a tightly validated relative path. Authentication errors such as 401 stop immediately. Transient 429 and 503 responses are retried no more than the configured budget. Once status 200 arrives, the function still verifies that items is a list; accepting arbitrary response bodies can break downstream rendering. This fixture intentionally has **no delay** between retries to keep tests deterministic. A real client must implement capped exponential backoff with jitter, honor valid Retry-After guidance, apply connection/read timeouts, and bound total elapsed time. It should handle transport exceptions and cancellation, observe API rate limits and avoid logging tokens or private payloads.

## Bounded failure laboratories
1. Add tests for 400, 403, 500 and malformed 200 bodies. State exactly which failures retry and why.
2. Accept an injected scheduler instead of calling sleep inside business logic. Assert that delay increases but never exceeds a ceiling.
3. Add simulated network exceptions before the HTTP response; decide which are safe for a read-only GET and how they consume attempt budget.
4. Model a POST separately with an idempotency key supported by the server. Explain why a client-generated key does not guarantee safety unless the server enforces it.

**Evidence:** PASS output, a status/attempts table, schema-failure logs without secrets and a documented real-world timeout and backoff policy.
## Further engineering detail

A retry count alone does not bound waiting time. Share one monotonic deadline across attempts and backoff, and inspect whether the HTTP client bounds connection and read phases separately. An overall budget is especially important on mobile devices where reconnects can consume most of the useful interaction window.

[Monotonic deadlines across a retry budget](#read:fieldnotes-en-36)
