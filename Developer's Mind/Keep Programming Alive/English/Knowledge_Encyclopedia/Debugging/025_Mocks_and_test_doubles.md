# Test doubles — injected clocks and transports with observable calls

## Scenario and independent contract
A local client fetches a document by slug but must not contact its transport after the deadline. Invalid slugs are rejected, responses must contain a title, and a timeout leaves the transport untouched. Unit tests should not make real network requests or depend on wall-clock sleeps. Inject a clock and transport interface so fixtures can advance time deterministically and inspect the exact requested slug.

## Executable Python 3 lab
Save as mock_lab.py and run python3 mock_lab.py. The fake transport records calls instead of sending packets. The fake clock starts at zero and can be moved without waiting.

~~~python
class FakeClock:
    def __init__(self):
        self.tick = 0
    def now(self):
        return self.tick

class FakeTransport:
    def __init__(self, answer):
        self.answer = answer
        self.calls = []
    def request(self, slug):
        self.calls.append(slug)
        return self.answer

def fetch(slug, transport, clock, deadline):
    if clock.now() > deadline:
        raise TimeoutError("deadline exceeded")
    if not isinstance(slug,str) or not slug.isascii() or not slug.isalnum():
        raise ValueError("invalid slug")
    value = transport.request(slug)
    if not isinstance(value,dict) or "title" not in value:
        raise ValueError("invalid response")
    return value["title"]

clock = FakeClock()
stub = FakeTransport({"title":"local"})
assert fetch("abc2",stub,clock,10) == "local"
assert stub.calls == ["abc2"]
clock.tick = 11
try:
    fetch("abc2",stub,clock,10)
except TimeoutError:
    pass
else:
    raise AssertionError("deadline bypassed")
assert stub.calls == ["abc2"]
print("PASS: injected clock, transport and call history")
~~~

## What is a mock, stub or fake?
A stub supplies canned responses. A fake provides a small working implementation of a collaborator. A mock primarily verifies interactions, such as whether request was called exactly once. Our FakeTransport combines canned responses with a call history; labels are less important than the test's explicit expectations. Tests that merely duplicate the implementation's own branching logic are weak: write the deadline and input contracts separately before coding. Contract tests against a real transport implementation are still needed because injected fakes cannot discover protocol incompatibilities.

## Failure-oriented exercises
1. Change the fake response to an empty dictionary and ensure validation raises rather than returning success.
2. Try a slug containing a slash, space or Unicode character. Decide whether your application wants a different explicit slug policy.
3. Move the clock to exactly the deadline, then one tick later. Document whether the rule uses greater-than or greater-than-or-equal.
4. Create a faulty implementation that sends before checking the clock. The existing call-history assertion should fail; restore correct ordering afterwards.

**Evidence:** PASS, an unchanged call count on timeout, invalid-response test, and one boundary convention for the deadline.
