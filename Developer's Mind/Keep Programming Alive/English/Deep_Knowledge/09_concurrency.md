# Async concurrency — reproduce a lost update and protect it

## Scenario and acceptance criteria
Fifty asynchronous jobs each increment a shared counter once. The correct result is 50, but an interleaving read/yield/write sequence loses updates when several jobs observe the same old value. The example deliberately reproduces this failure before protecting the read-modify-write operation with asyncio.Lock. It uses one event loop, not multiple OS threads.

## Executable lab — Python 3 standard library
Save the example as `09_concurrency.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
import asyncio
async def unsafe():
    state = {"value": 0}
    async def job():
        before = state["value"]
        await asyncio.sleep(0)
        state["value"] = before + 1
    await asyncio.gather(*(job() for _ in range(50)))
    return state["value"]
async def safe():
    state, lock = {"value": 0}, asyncio.Lock()
    async def job():
        async with lock:
            before = state["value"]
            await asyncio.sleep(0)
            state["value"] = before + 1
    await asyncio.gather(*(job() for _ in range(50)))
    return state["value"]
assert asyncio.run(unsafe()) == 1
assert asyncio.run(safe()) == 50
print("PASS async lock and deterministic lost update")
~~~

## Technical explanation
Concurrency means tasks can interleave; it does not imply parallel CPU execution. Await is a suspension point: a task that reads state and then awaits allows other tasks to read the same old value. Locking only the final write is insufficient because the stale read already occurred. Place the full invariant-preserving read-modify-write section inside a lock. A lock protects only code paths that use that same lock; it does not automatically protect external processes or persistent storage.

## Bounded practice
Move the lock to protect only the assignment and verify that the bug returns. Increase jobs to 1000 and measure correctness, not just throughput. Add cancellation while a task waits for the lock and verify no lock leaks using async with. If the operation moves to SQLite, use database transactions rather than relying on an in-process Python lock.

## Diagnostics and completion evidence
If an async task appears frozen, inspect awaited operations and whether a task holds a lock while waiting on an unrelated resource. Avoid time.sleep inside the event loop. Do not infer a thread race solely from this coroutine example: asyncio scheduling and thread synchronization are different mechanisms.
