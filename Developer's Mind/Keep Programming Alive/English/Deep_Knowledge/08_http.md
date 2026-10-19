# HTTP API client — route restrictions and response contracts

## Scenario and acceptance criteria
A synthetic API reader may ask only for GET /api/items. It must not send requests to arbitrary hosts, use queries or redirects, or accept oversized response bodies. A valid response has status 200, media type application/json and a JSON object with exactly one items array of at most four short strings. The transport function is injected, so the example executes with no real network.

## Executable lab — Python 3 standard library
Save the example as `08_http.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
import json
from urllib.parse import urlsplit
def read_page(path, transport):
    p = urlsplit(path)
    if (p.scheme or p.netloc or p.fragment or p.query or
            p.path != "/api/items"):
        raise ValueError("only /api/items is permitted")
    status, media, body = transport(path)
    if status != 200:
        raise RuntimeError("unexpected status")
    if media.split(";")[0].strip().lower() != "application/json":
        raise ValueError("unexpected content type")
    if not isinstance(body, bytes) or len(body) > 256:
        raise ValueError("payload too large or not bytes")
    obj = json.loads(body.decode("utf-8"))
    if not isinstance(obj, dict) or set(obj) != {"items"}:
        raise ValueError("invalid schema")
    if not isinstance(obj["items"], list) or len(obj["items"]) > 4:
        raise ValueError("too many items")
    if not all(type(v) is str and len(v) <= 32 for v in obj["items"]):
        raise ValueError("invalid item")
    return obj["items"]
fetch = lambda _: (200, "application/json; charset=utf-8", b'{"items":["a","b"]}')
assert read_page("/api/items", fetch) == ["a", "b"]
for bad in ("https://bad.site/api/items", "//bad.site/api/items",
            "/api/items?token=secret", "/api/items/../items"):
    try: read_page(bad, fetch)
    except ValueError: pass
    else: raise AssertionError("unsafe path accepted")
print("PASS HTTP response contract")
~~~

## Technical explanation
URL parsing is not authorization. The route is compared to one exact allowlisted path after checking that scheme, host, fragment and query are absent. The client must inspect status, content type and payload length before decoding JSON, then enforce schema constraints. In production, a streaming transport must cap bytes while receiving them, not after downloading an unlimited response. Timeouts and redirect policies belong at the actual transport boundary.

## Bounded practice
Inject a 404 response, text/html content, truncated JSON, five items, a non-string item and a body larger than 256 bytes. Record the correct error for each. If later adding pagination, cap the number of pages and reject repeated cursor tokens. Retry safe GET requests only for documented transient failures, with bounded backoff; never blindly replay a mutable POST.

## Diagnostics and completion evidence
If a request uses an unexpected host, fail before calling transport. If media type is JSON but the payload is invalid, distinguish decoding failure from schema failure. Test redirect attempts with an actual transport only in an isolated local fixture; default URL openers can follow redirects unless configured otherwise.
