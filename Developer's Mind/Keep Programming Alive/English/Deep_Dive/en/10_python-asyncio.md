# Python asyncio tasks and cancellation

## What is happening
asyncio runs coroutines cooperatively on an event loop. Blocking disk or CPU work inside a coroutine can still freeze other scheduled tasks.

## Practical investigation
Pass explicit timeouts for network I/O. When cancellation happens, release acquired resources in finally and propagate CancelledError.

## Common traps
Use TaskGroup when supported to own related child tasks and ensure exceptions are not silently ignored.

## Adaptable demonstration
```text
python -c 'import asyncio; print(asyncio.__name__)'
```

## Observe cleanup during cancellation
~~~python
import asyncio

async def worker(started, cleaned):
    try:
        started.set()
        await asyncio.sleep(60)
    finally:
        cleaned.append('released')

async def main():
    started = asyncio.Event()
    cleaned = []
    task = asyncio.create_task(worker(started, cleaned))
    await started.wait()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    assert cleaned == ['released']

asyncio.run(main())
~~~
The event proves the worker entered its protected region before cancellation, making the fixture deterministic without an arbitrary sleep in the test. The long sleep is cancelled; the fixture does not wait sixty seconds. Awaiting the task retrieves its final cancellation state. A worker that catches cancellation and silently returns can disrupt structured-concurrency ownership.

TaskGroup requires Python 3.11 or later. Keep blocking work out of the event loop, and remember that cancelling an await does not automatically stop arbitrary work already running in a separate thread.

Reference: [asyncio task behavior](https://docs.python.org/3/library/asyncio-task.html).
