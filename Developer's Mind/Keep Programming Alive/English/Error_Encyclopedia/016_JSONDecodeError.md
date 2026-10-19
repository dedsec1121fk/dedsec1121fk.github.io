# JSONDecodeError — find the first invalid token, not the last symptom

## Meaning
json.loads expects one valid JSON value. A trailing comma, single-quoted key, HTML error page or empty response violates that grammar. The decoder reports line, column and absolute character offset.

~~~python
import json
from json import JSONDecodeError

bad = '{"enabled": true,}'
try:
    json.loads(bad)
except JSONDecodeError as exc:
    assert exc.lineno == 1
    print("invalid position:", exc.pos, "near:", repr(bad[max(0, exc.pos-8):exc.pos+8]))
~~~

## Repair the producer and protect the consumer
Check HTTP status and Content-Type before parsing a remote response; an HTTP 500 with an HTML body should not be treated as JSON. Correct the producer to emit double-quoted strings without trailing commas. If a file can be empty, define what empty means before introducing a default object.

~~~python
valid = json.loads('{"enabled": true}')
assert valid["enabled"] is True
~~~

## Lab
Test empty text, 'null', an array instead of an object, and a valid object missing the 'enabled' key. Notice that valid JSON can still violate application schema. Validate the decoded type and required fields *after* decoding. Never patch broken JSON by blindly deleting punctuation from arbitrary input. Reference: https://docs.python.org/3/library/json.html

## Separate decoding from validation
~~~python
import json
def read_config(raw):
    obj = json.loads(raw)
    if not isinstance(obj, dict) or not isinstance(obj.get("enabled"), bool):
        raise ValueError("config.enabled must be boolean")
    return obj
~~~
The input `"null"` is valid JSON but has the wrong shape, while `"{invalid}"` must fail during decoding. For an HTTP response, verify status and media type before assuming the body is JSON; an HTML error page produces a very different root cause from a missing config key. Avoid echoing untrusted response bodies into error logs with credentials.
