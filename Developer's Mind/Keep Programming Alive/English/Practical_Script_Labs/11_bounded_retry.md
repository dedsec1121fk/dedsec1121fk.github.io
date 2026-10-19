# Practical scripts: retries, caching and graph traversal

## Retry Temporary Failures Safely

### The retry contract
11_bounded_retry.py retries only TimeoutError, with a fixed max_attempts count. A ValueError or other permanent exception is allowed to propagate immediately. The parameter is checked with exact integer type equality, so max_attempts=True is rejected rather than accidentally treated as one attempt. A caller-supplied pause callback receives the failed attempt number before the next attempt.

### Run the controlled simulation
Execute python 11_bounded_retry.py. The simulated operation times out twice and succeeds on the third call. The test verifies exactly three invocations and pause callback arguments [1,2]. A separate check verifies that a ValueError is not swallowed; a boolean attempt limit is rejected. Expected output: retry budgets and exception boundaries passed.

### Timing and side-effect safety
The default pause callback deliberately does nothing, keeping the teaching script fast and deterministic. In real network software, supply a bounded exponential backoff with jitter and enforce a total elapsed-time budget. Retry only operations known to be idempotent or protected with an idempotency key: a timeout can occur after a server has already committed a payment or write.

### Further tests
Create an action that always raises TimeoutError and prove that it stops exactly at max_attempts and re-raises the final error. Add a deadline and an injectable clock, then test clock advancement without real sleeping. Log attempt counts without sensitive request bodies. Source: 11_bounded_retry.py. Reference: https://docs.python.org/3/library/exceptions.html#TimeoutError

## Memoize Pure Function Results

### Why pure functions are good cache candidates
12_memoization.py implements Fibonacci using functools.lru_cache(maxsize=128). Each result depends only on its integer argument, so caching preserves correctness. A naive recursive Fibonacci repeats work; the cache reuses previous subproblems. The function rejects booleans, floats, negatives and inputs above 200 to make the recursion depth and domain explicit.

### Execute and inspect
Run python 12_memoization.py. It clears the cache, confirms fibonacci(10)==55, repeats the same call and verifies cache_info().hits grows by one. It also tests n=0 and n=1 and rejects several invalid inputs. Expected message: memoization correctness and cache-hit checks passed. cache_info() exposes hits, misses, current size and maximum size; these are measurable facts rather than promises of speed.

### Important limitations
lru_cache uses argument values as cache keys and can retain references to those arguments and results until eviction. Do not cache a function whose output depends on current time, network state, mutable global data or user permissions without explicit invalidation. Since the limit is 128, old entries may be evicted even if the same Fibonacci input is requested again later.

### Extend the lesson
Compare repeated calls with a noncached iterative Fibonacci implementation, separately recording correctness and elapsed time for suitable n. Explain why naive recursion without caching has exponential repeated work. Add cache_clear when inputs are deliberately invalidated. Never assume caching untrusted mutable objects is safe. Source: 12_memoization.py. Reference: https://docs.python.org/3/library/functools.html#functools.lru_cache

## Traverse a Graph with BFS

Breadth-first search visits nodes layer by layer using a FIFO queue. Record visited nodes before enqueueing neighbors to prevent cycles from growing the queue repeatedly.

Test a disconnected graph, a self-loop, a diamond-shaped graph and a missing target. BFS finds shortest paths only when all edges have equal weight.

**Working source:** `13_queue_bfs.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.
