# Observability — structured events without leaking private inputs

## Scenario and acceptance criteria
Record only bounded diagnostic metadata for an offline import: severity, stable machine-readable error code, short correlation ID, elapsed milliseconds and attempt number. Never include raw file contents, email addresses, authorization tokens or passwords. If someone tries to attach an unexpected field, fail instead of silently serializing sensitive data.

## Executable lab
Save as `15_observability.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
import json, re
ALLOWED = {"duration_ms", "attempt"}
def event(level, code, trace_id, **fields):
    if level not in {"INFO","ERROR"}:
        raise ValueError("invalid severity")
    if not re.fullmatch(r"[a-f0-9]{8}", trace_id):
        raise ValueError("invalid correlation ID")
    if set(fields) - ALLOWED:
        raise ValueError("unexpected or sensitive field")
    if "duration_ms" in fields and (type(fields["duration_ms"]) is not int or fields["duration_ms"] < 0):
        raise ValueError("duration outside range")
    if "attempt" in fields and (type(fields["attempt"]) is not int or fields["attempt"] < 1):
        raise ValueError("invalid attempt")
    return json.dumps({"level":level,"code":code,"trace":trace_id,**fields},
                      ensure_ascii=False,sort_keys=True)
line = event("ERROR","IMPORT_FAILED","deadbeef",duration_ms=12,attempt=1)
assert json.loads(line)["duration_ms"] == 12
assert "\n" not in line
for extra in ({"password":"secret"},{"email":"a@example.invalid"}):
    try: event("INFO","TRY","deadbeef",**extra)
    except ValueError: pass
    else: raise AssertionError("sensitive field accepted")
print("PASS structured log allowlist")
~~~

## Technical interpretation
A structured JSON event can be parsed and aggregated without fragile string splitting. Correlation IDs let separate events from the same operation be connected; they must not become a replacement for secret session tokens. Severity and error codes should describe verified outcomes: a UI click is not evidence that a file save completed. Whitelisting metadata is safer than repeatedly trying to scrub unknown data structures. Event volume, retention and storage access also need explicit limits in a real application.

## Bounded experiments
Add a test for an unknown field and invalid correlation ID. Print a valid Greek error message using ensure_ascii=False while preserving a stable ASCII event code. Inject newlines into a field and confirm the JSON encoder cannot create extra physical log records. Distinguish import_start from import_success and log the latter only after a completed write.

## Diagnostics
If logs appear empty, check whether code paths emit events after actual success or failure. If a field contains private text, remove it at the logging call boundary rather than relying solely on later redaction. Test dashboard counts against known synthetic outcomes to detect missing or doubled events.
## Further engineering detail

Filter structured event fields before serialization and before forwarding to any sink. A regular expression over a final log line cannot reliably find a secret nested inside an exception or request object. Include negative fixtures with fake credentials and check the retained diagnostic fields as well as the absence of the secrets.

[Structured log redaction before serialization](#read:fieldnotes-en-44)
