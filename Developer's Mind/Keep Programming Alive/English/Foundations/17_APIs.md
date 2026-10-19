# HTTP, JSON and API boundaries

A browser UI sends HTTP requests to a server. Validate all input on the server, check status codes, and never trust that a button click implies a saved state. For DedSec OS, trace the client event to the /api/ handler and persisted file.

## Worked example

```text
import json
payload = {"ok": True, "count": 3}
encoded = json.dumps(payload)
print(json.loads(encoded)["count"])
```

## Practice

Add a "version" key without breaking the old "count" consumer.

## Corrected result / hint

Adding an optional JSON field keeps this read compatible.

## Separate transport, protocol and application failure
An HTTP request may fail before reaching a server (DNS, connection, TLS), return an HTTP error (400, 404, 429, 503) or succeed at HTTP level but carry invalid JSON. Implement finite timeouts, validate returned structure and retry only transient failures where repeating the operation is safe.
```python
import json
def read_items(response_text):
    obj=json.loads(response_text)
    if not isinstance(obj,dict) or not isinstance(obj.get("items"),list):
        raise ValueError("expected an object with items array")
    return obj["items"]
assert read_items('{"items":[]}')==[]
```
When using a real client, distinguish `401` credentials from `403` access policy, `404` missing resource, `429` backoff/rate limit. Never indiscriminately retry a money transfer or non-idempotent POST.

**Exercise:** supply malformed JSON, JSON with the wrong root type and JSON with missing items; add specific error handling for each without masking the failure.

## Test the application contract without a network request

~~~python
import json
payload = json.loads('{"items":[{"id":1},{"id":2}]}')
assert [item["id"] for item in payload["items"]] == [1, 2]
try:
    json.loads('{"items":[')
except json.JSONDecodeError:
    pass
else:
    raise AssertionError("invalid JSON accepted")
~~~

An HTTP 200 alone does not establish a valid schema. Treat malformed JSON, missing `items`, a 404 response and a 429 rate limit as **different** failure classes. A paginated client should stop when the documented next-page cursor is absent, rather than fetching page one forever. Keep credentials out of logs; simulate server errors with a stub response instead of hitting a live endpoint. Independent task: define bounded retry/backoff for transient 503 failures but not for a malformed local payload. Reference: https://www.rfc-editor.org/rfc/rfc9110
