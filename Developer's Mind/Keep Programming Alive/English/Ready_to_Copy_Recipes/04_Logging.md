# Recipe: privacy-bounded event logging to JSON Lines

## Scenario and acceptance criteria
A local scanner needs machine-readable success and failure events. Restrict the emitted schema to one stable event code and an integer count. The fixture records two events into an in-memory stream, checks each row can be decoded, and refuses an arbitrary event name that might contain an email address or credential.

## Complete executable example
Save as `04_Logging.py` and run with Python 3 and the standard library. The fixture works without internet or access to your real files.

~~~python
import io, json
def record(sink, code, changed):
    if code not in {"SCAN_OK","SCAN_FAILED"} or type(changed) is not int or changed<0:
        raise ValueError("invalid event schema")
    event={"code":code,"changed_count":changed}
    sink.write(json.dumps(event,sort_keys=True,separators=(",",":"))+"\n")
log=io.StringIO()
record(log,"SCAN_OK",2)
record(log,"SCAN_FAILED",0)
rows=[json.loads(line) for line in log.getvalue().splitlines()]
assert rows==[{"changed_count":2,"code":"SCAN_OK"},
             {"changed_count":0,"code":"SCAN_FAILED"}]
assert "password" not in log.getvalue()
try: record(log,"user@example.invalid",1)
except ValueError: pass
else: raise AssertionError("unknown log code accepted")
assert len(log.getvalue().splitlines())==2
print("PASS minimal privacy-safe JSONL events")
~~~

## Technical explanation
One JSON object per line can be inspected with ordinary text tools without inventing a custom delimiter. The fixed allowlist prevents raw scanned filenames, note contents and user identifiers from being accidentally attached. The example is not a production audit trail: timestamps, correlation IDs, retention periods and trustworthy delivery need extra design. Never treat a click or attempted command as success before verifying its resulting state.

## Bounded practice
Add a bounded elapsed_ms number and verify invalid negative values are rejected. Write logs to a temporary fixture and simulate a failed write; the logger must not claim success when the sink raises OSError. Test how JSON escapes newline characters if you later allow short sanitized descriptions. Decide when to rotate and delete old local logs.

## Diagnostics and safety
If the count in a log does not match the number of processed files, check whether a failed operation emitted a success record too early. Use fixed codes rather than mixing translated UI messages with programmatic identifiers. If private paths appear in logs, remove them at the event-construction point instead of relying on later filtering.
