# Chunked batch processing — what this script does not rate-limit

## Python 3 reference source
~~~python
def chunks(values, size):
    if size <= 0: raise ValueError('size')
    for start in range(0, len(values), size):
        yield values[start:start+size]
assert list(chunks(list(range(5)),2)) == [[0,1],[2,3],[4]]
~~~

## Explicit distinction
The supplied Python generator partitions a preexisting list into slices with maximum length size. It **does not** wait between network calls, enforce requests per second, retry errors or coordinate multiple workers. Naming it a 'rate limiter' would mislead maintainers: chunking controls batch size, while rate limiting controls events over time.

## Generator behavior
chunks(values, size) yields each successive slice. It raises ValueError if size<=0. With five values and size=2 the output is [[0,1],[2,3],[4]]. Iteration is lazy, but the example list(range(5)) is already materialized and each values[start:start+size] creates a copy containing up to size references.

## Failure and performance tests
1. Verify empty input produces no batches while a valid positive size is still required.
2. Request size=1 and observe one element per yield. Request size>len(values) and observe exactly one batch.
3. Test zero and negative batch size and expect ValueError rather than an infinite loop.
4. Attach a consumer that raises on batch two. Explain how an interrupted generator differs from completed delivery; record progress for recovery.
5. With huge data, replace list slicing with a streaming iterator that accumulates at most size values instead of materializing the full input.

## True rate limiting is a separate layer
For an API allowing R requests per window, track a monotonic-clock budget or token bucket, respond to Retry-After where applicable, and use bounded concurrency. A sleep after every batch is not a complete solution, especially with parallel workers. Ensure idempotency before retries and log success/failure per batch.

## 15 rate limited batch — boundary study

Rate limiting is distinct from concurrency control. A semaphore caps simultaneous requests, while a rate budget caps requests per time window. A service may enforce both independently.

For HTTP 429, inspect `Retry-After`, cap retries and introduce jitter to prevent synchronized clients hammering the service. Never retry invalid credentials indefinitely.

<!-- [curated-algorithm-detail:15_rate_limited_batch.md] -->
