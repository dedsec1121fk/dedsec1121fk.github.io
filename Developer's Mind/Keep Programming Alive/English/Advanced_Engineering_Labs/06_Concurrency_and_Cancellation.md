# Concurrency and cancellation — release shared resources reliably

## Scenario and invariant
An offline indexing task may be cancelled when the user closes a knowledge page. Shared asynchronous resources such as locks must be released even if cancellation happens during a suspended await. Concurrency interleaves tasks, whereas parallelism means simultaneous execution. Python asyncio coroutines cooperate at await boundaries and do not automatically protect shared mutable state. An application must define ownership, cancellation boundaries and cleanup before adding workers.

## Executable Python 3.11+ fixture
Save as cancellation_lab.py and run python3 cancellation_lab.py. The worker acquires a lock, announces that it started, then waits on an event. The controller cancels the task and checks that its finally block released the lock, allowing another task to acquire it. No threads, network, disk writes or timers are required.

~~~python
import asyncio

async def do_work(lock, started, unblock, trace):
    async with lock:
        trace.append('entered')
        started.set()
        try:
            await unblock.wait()
            trace.append('finished')
        finally:
            trace.append('cleanup')

async def test():
    lock, started, unblock = asyncio.Lock(), asyncio.Event(), asyncio.Event()
    trace = []
    task = asyncio.create_task(do_work(lock, started, unblock, trace))
    await started.wait()
    assert lock.locked()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    else:
        raise AssertionError('cancellation not delivered')
    assert trace == ['entered', 'cleanup']
    assert not lock.locked()
    async with lock:
        trace.append('reacquired')
    assert trace[-1] == 'reacquired'
    print('PASS async: cancellation, finally cleanup, lock release')

asyncio.run(test())
~~~

## Interpreting the outcome
When Task.cancel requests cancellation, a CancelledError is delivered at a suspension point. The finally block runs during stack unwinding and the async-with lock context releases the lock. Checking lock.locked is evidence for this fixture, not a guarantee about arbitrary blocking code or every library. Cancellation can race with normal completion; tests need to distinguish both outcomes. A released lock does **not** imply a filesystem write or database transaction has been rolled back. For durable changes, use database transactions or verified temporary-file replacement independently of asyncio cancellation handling.

## Bounded experiments and diagnostics
1. Move task.cancel to before started.wait, then observe how assertions must change when the task was never scheduled.
2. Put a second worker behind the same lock and verify it can proceed after the first is cancelled. Check the trace for cleanup exactly once.
3. Introduce a deliberately failing operation under the lock. Show whether the finally block runs for ordinary exceptions as well as cancellation.
4. Simulate a partial temporary-file write on a disposable path. Design independent cleanup and atomic replacement; do not assume cancellation itself reverts bytes.

**Completion evidence:** PASS, exact trace order, distinction between concurrency and parallelism, and a recovery plan for partially persisted work.
## Further engineering detail

Cancellation and overload meet at queue shutdown. A producer waiting to enqueue must learn when all consumers have failed. Define how blocked producers wake, how accepted tasks are acknowledged and whether unfinished tasks survive restart. Bounded buffering makes this policy necessary instead of concealing overload in memory growth.

[Bounded work queues and overload decisions](#read:fieldnotes-en-37)
