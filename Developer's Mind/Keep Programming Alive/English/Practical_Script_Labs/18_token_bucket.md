# Token bucket rate limiting — deterministic admission tests

## What the implementation actually guarantees
A token bucket permits short bursts of requests and then replenishes capacity at a configured rate. In the included Python implementation, capacity is the maximum count of stored tokens, rate is the number of tokens added per time unit, and a request costs one token. An allow(now) call advances internal state to the supplied timestamp. The caller must use a monotonic clock measured in consistent units; the class does not read the clock itself.

**Working source:** 18_token_bucket.py in this directory. Execute python3 18_token_bucket.py first, then copy the independent test below into test_bucket.py and execute it in the same directory. The test imports the numeric-named source with runpy, without renaming the original file.

## Tested boundary experiment
~~~python
from runpy import run_path
TokenBucket = run_path("18_token_bucket.py")["TokenBucket"]
b = TokenBucket(2, 1)
assert [b.allow(t) for t in (0, 0, 0, 0.5, 1, 1)] == [
    True, True, False, False, True, False
]
try:
    b.allow(0.25)
except ValueError:
    pass
else:
    raise AssertionError("time regression accepted")
assert TokenBucket(0.5, 1).allow(1) is False
print("PASS bucket: burst, refill, regression, sub-token capacity")
~~~

## Trace the bucket by hand
With capacity 2 and rate 1, the first two calls at time 0 consume both tokens. The third at time 0 is rejected. At time 0.5, only 0.5 tokens have accumulated, so the request is still rejected. At time 1, a full token is available and is consumed. A second request at time 1 is rejected. The class raises ValueError when a supplied timestamp moves backward; this is why system-wall-clock time is not a safe source for rate limiting.

## Inspect limitations rather than hiding them
The current source only checks that capacity and rate are greater than zero. It does not reject non-finite floats such as NaN and infinity, and a capacity smaller than one means no request can ever pass. These are improvement tasks, not validated production guarantees. Multiple tasks sharing the same instance also need synchronization to keep read-modify-write state atomic. Recreating a new instance on every request defeats enforcement.

## Independent exercises
1. Add validation with math.isfinite for capacity, rate and each timestamp. Decide whether capacity must be at least one. Preserve state when validation fails and add assertions.
2. Inject time.monotonic into a wrapper instead of calling time.time directly. Simulate a backward jump and explain why the wrapper never uses it.
3. Draw a two-column trace of timestamps and token counts for the six calls. Compare a token bucket with a strict sliding-window limiter for burst traffic.
4. Measure admitted requests over ten simulated seconds with no real sleeping. State the configured rate and maximum initial burst.

**Completion evidence:** both scripts run, the expected six admission decisions match, backward time is rejected and the non-finite input gap is explained. A token bucket is a throughput gate, not a fairness queue.
