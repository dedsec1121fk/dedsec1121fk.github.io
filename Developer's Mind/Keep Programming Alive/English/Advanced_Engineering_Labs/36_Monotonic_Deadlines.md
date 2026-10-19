# Monotonic deadlines across a retry budget

## Mechanism and contract

A wall clock answers which date an event occurred. A monotonic clock answers how much time elapsed inside a running system. If a timeout uses a wall-clock difference, a manual correction can unexpectedly extend or shorten it. A deadline should be calculated once, then each attempt receives only the remaining allowance.

Three attempts with a fresh ten-second timeout can consume roughly thirty seconds plus waits. A ten-second overall deadline must include connection setup, response reads, retry delays and cleanup. Passing a timeout to a client library does not necessarily bound every stage; inspect its contract. A synchronous operation that ignores cancellation can still exceed the budget, so this example tests arithmetic without pretending to interrupt arbitrary blocking code.

## Worked local example

```python
def remaining(deadline, now):
    return max(0.0, deadline - now)

start = 100.0  # injected monotonic clock fixture
deadline = start + 10.0
assert remaining(deadline, 103.0) == 7.0
assert remaining(deadline, 109.5) == 0.5
assert remaining(deadline, 111.0) == 0.0
# Production: deadline = time.monotonic() + budget
print("single budget preserved")
```

## Failure checks and limits

Use an injected clock to simulate jumps in wall time while monotonic time advances normally. Never persist a monotonic deadline as a portable calendar timestamp: its reference point is unspecified. After process or device restart, reconstruct policy from durable wall-time metadata and the application's expiry rules. Define whether suspended device time counts toward the task's limit.

## Primary reference

[Official documentation](https://docs.python.org/3/library/time.html#time.monotonic)
