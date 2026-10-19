# Cancellation — a request, not rollback

## Operational definition
Cancelling a task asks cooperative code to stop at an interruption point. It does not roll back database transactions, erase an HTTP request already received or undo a filesystem change already committed. Cancellation also differs from timeout: a caller may stop waiting while a server continues processing. A robust application specifies which cleanup must run, which exception must propagate and how it handles effects that may already have happened.

## Deterministic Python asyncio demonstration
Save as cancel_lab.py and run python3 cancel_lab.py. Events coordinate the test without unreliable arbitrary sleeps. The worker is suspended at a cancellable await, and its finally block signals cleanup. A separate exception checks that cancellation handling does not accidentally swallow unrelated bugs.

~~~python
import asyncio

async def work(started, cleaned):
    try:
        started.set()
        await asyncio.Event().wait()
    finally:
        cleaned.set()

async def failing():
    raise RuntimeError('real failure')

async def main():
    started, cleaned = asyncio.Event(), asyncio.Event()
    task = asyncio.create_task(work(started, cleaned))
    await started.wait()
    assert task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    else:
        raise AssertionError('cancellation not propagated')
    assert cleaned.is_set() and task.cancelled()
    try:
        await failing()
    except RuntimeError:
        pass
    else:
        raise AssertionError('unexpected exception was swallowed')
    finished = asyncio.create_task(asyncio.sleep(0, result='done'))
    assert await finished == 'done'
    assert not finished.cancel()  # Cancellation cannot undo completed work.
    print('PASS asyncio cancellation, cleanup, unrelated errors')

asyncio.run(main())
~~~

## What each assertion establishes
started.wait guarantees the worker reached its cooperative suspension point before task.cancel. Awaiting the cancelled task raises asyncio.CancelledError, which must propagate to an appropriate owner. The finally block runs and signals cleaned. A task that has already finished cannot be retroactively cancelled; this example checks that cancel() returns false. If external work was already committed, the application needs an idempotent retry key, reconciliation or compensating action rather than pretending cancellation undoes history.

## Failure drills
1. Remove the finally cleanup and rerun the test; explain why a background lock or file could remain held.
2. Insert a protected resource using a context manager and trace its release when cancellation arrives during await.
3. Replace the failing function with a network mock raising RuntimeError. Catch that error separately; do not turn every exception into cancellation success.
4. Simulate a service accepting a request just before its caller times out. Document what the caller can truthfully know and when status must be checked.

**Evidence:** PASS, a cancellation state trace (created, running, cancelled, cleaned), and a rule for retrying already-committed work.
