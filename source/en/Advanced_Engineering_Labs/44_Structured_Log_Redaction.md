# Structured log redaction before serialization

## Mechanism and contract

Redacting an already formatted line is fragile: a token can appear under another key, in an exception message or in a nested object. Prefer an allowlist of fields appropriate to an event type, then redact before serialization and before handing the event to multiple sinks. A debug sink must not silently bypass the production policy.

An allowlist is not sufficient if an allowed message field contains arbitrary request bodies. Prefer stable event codes and bounded, typed fields such as status, duration and request ID. A correlation ID should help connect operations without becoming a session credential or personal identifier. The fixture intentionally rejects extra fields rather than attempting to guess whether their contents are sensitive.

## Worked local example

```python
import json
ALLOWED = {"event", "status", "duration_ms", "request_id"}
def serialize_event(event):
    safe = {k: event[k] for k in ALLOWED if k in event}
    return json.dumps(safe, ensure_ascii=False, sort_keys=True)
raw = {"event":"request_done", "status":200, "request_id":"fixture-1",
       "password":"FAKE_SECRET_FOR_TEST", "headers":{"cookie":"FAKE_COOKIE"}}
line = serialize_event(raw)
assert "FAKE_SECRET_FOR_TEST" not in line and "FAKE_COOKIE" not in line
assert json.loads(line)["status"] == 200
print(line)
```

## Failure checks and limits

This teaching filter assumes the retained fields already satisfy their types and size limits. Production code should validate those fields and bound nesting before logging. Test exception paths and every configured sink with unmistakable fake secrets. Also verify that enough operational context survives; a log containing only “error” is private but rarely useful for diagnosis.

## Primary reference

[Official documentation](https://docs.python.org/3/library/logging.html)
