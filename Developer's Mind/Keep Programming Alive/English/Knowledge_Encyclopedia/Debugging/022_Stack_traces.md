# Software diagnostics — stack traces, logging and testing

## Stack traces

### Practical explanation
A stack trace records active call frames at a failure. Read from the triggering exception and locate the nearest relevant frame in your own code, while distinguishing cause from later propagation.

### Worked illustration
~~~python
def read_score(data): return int(data['score'])
def handle(data): return read_score(data)
try: handle({'score':'oops'})
except ValueError as exc: assert 'invalid' in str(exc)
~~~

### Realistic exercise
Capture and inspect traceback on a disposable input. Compare original failure with a broad except that hides it, and show how to preserve exception chaining.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Stack traces from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Logging and observability

### Practical explanation
Logs record events; metrics summarize numerical signals and traces connect operations across components. Combining them can identify bottlenecks, but they answer different questions and require privacy controls.

### Worked illustration
~~~python
import logging
logging.basicConfig(level=logging.INFO)
logging.info('batch completed count=%d',3)
~~~

### Realistic exercise
Add a request correlation ID and timing metric for a synthetic batch. Keep tokens and raw personal records out of the log message.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Logging and observability from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Unit integration and end-to-end tests

### Practical explanation
A unit test isolates a function, an integration test exercises boundaries such as a real database, and an end-to-end test covers a user flow. They expose different failures and have different cost/stability.

### Worked illustration
~~~python
def normalize(text):return text.strip().casefold()
assert normalize(' Ada ')=='ada'
~~~

### Realistic exercise
Turn the assertion into unittest. Then build a SQLite integration check using a temporary database, without calling the integration check a unit test.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Unit integration and end to end tests from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Regression protection

### Practical explanation
A regression test preserves the smallest case that exposed a previously fixed defect. Without checking that it failed before the fix, the new test might not guard the actual bug.

### Worked illustration
~~~python
def safe_ratio(a,b):
    if b==0:raise ZeroDivisionError('denominator')
    return a/b
assert safe_ratio(4,2)==2
~~~

### Realistic exercise
Write a test requiring the expected exception for a zero denominator and compare with a previous version that returned a misleading default.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Regression protection from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Performance profiling

### Practical explanation
Profiling observes where CPU time, allocations or IO waits occur. Optimizing the most visually complex function without measurement may not affect actual latency.

### Worked illustration
~~~python
import cProfile
cProfile.run('sum(i*i for i in range(10000))')
~~~

### Realistic exercise
Profile an intentionally slow nested-loop duplicate finder and a set-based alternative. Run multiple trials and avoid conflating startup with steady-state behavior.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Performance profiling from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Unit, integration, regression and property-based testing

### Separate a contract from implementation details
A good unit test asserts behavior that would remain true after an internal refactor. For a parser that accepts two comma-separated positive integers, define an explicit contract: either return both positive integers or raise ValueError for malformed input. Do not duplicate the parser logic inside the assertion, as both implementation and test could share the same mistake.

~~~python
def parse_pair(raw: str) -> tuple[int, int]:
    chunks = raw.split(",")
    if len(chunks) != 2:
        raise ValueError("expected two fields")
    try:
        left, right = (int(chunk.strip()) for chunk in chunks)
    except ValueError as exc:
        raise ValueError("invalid integer") from exc
    if left <= 0 or right <= 0:
        raise ValueError("both integers must be positive")
    return left, right

assert parse_pair("2, 3") == (2, 3)
for malformed in ("", "2", "2,a", "0,3", "2,3,4"):
    try:
        parse_pair(malformed)
    except ValueError:
        pass
    else:
        raise AssertionError("accepted invalid input")
~~~

Test a case like " 2 , 3 " to specify whitespace behavior. Explain whether "+2,3" should be accepted: the current int conversion permits plus signs, so the test suite must either document that or enforce a stricter grammar.

### Unit, integration and end-to-end scope
A unit test checks this small parsing contract. An integration test would check that the value reaches the database or downstream function as expected. An end-to-end test would exercise the actual user's form and error rendering. Passing a syntax check on JavaScript does not imply that mobile scrolling, visibility or input focus works.

### Property-based versus examples
For generated positive pairs, parsing their decimal representation should return the same pair. But a generator restricted to valid values will miss invalid boundary cases; explicitly test empty input, non-ASCII digits, overflow policy and extra delimiters. Preserve a reproducible failing seed when generated tests expose a defect.

### Regression discipline
Before a fix, write a test that reproduces the observed failure and fails for the old implementation. Only then change the code and confirm the same test passes. Keep the smallest failing fixture in version control without private user data.

### Verification
Submit test command, environment/version, failures observed before the fix and successful output afterward. Do not claim a test was run merely because the snippet contains assertions; assertions are proposed checks until executed.

## Logs, metrics, traces and actionable diagnostics

Logs describe discrete events; metrics summarize quantities over time; traces show causality across calls. Use structured event names, timestamps with timezone, severity levels and stable correlation identifiers. Error messages should explain *what* failed, *where*, and *what to do next*, without exposing credentials.

### Example
```python
import json
from datetime import datetime, timezone
record = {'event': 'backup.finished',
          'time': datetime.now(timezone.utc).isoformat(),
          'files': 12}
assert json.loads(json.dumps(record))['files'] == 12
```

### Practice
1. Make setup logs readable on a phone.
2. Record a failed update without capturing secret environment variables.
3. Add a correlation ID to a multi-step request.
4. Create diagnostic output for missing dependencies without reinstalling them automatically.

## Reproducing a bug

### Practical explanation
A reproducible bug report contains environment, input, steps, expected behavior and actual behavior. Remove irrelevant setup until the smallest case still fails; otherwise debugging effort can chase unrelated symptoms.

### Worked illustration
~~~python
def broken(items=[]):
    items.append(1)
    return len(items)
assert broken()==1
assert broken()==2
~~~

### Realistic exercise
Change the default to None and create a new list per call. Write a regression assertion that fails on the original implementation and passes on the fix.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Reproducing a bug from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.
