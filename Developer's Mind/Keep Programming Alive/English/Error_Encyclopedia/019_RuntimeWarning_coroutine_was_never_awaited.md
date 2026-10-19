# RuntimeWarning: coroutine was never awaited

## What was created?
Calling an async def function creates a coroutine object. It does not execute the function body to completion. If that coroutine is discarded without awaiting or scheduling, Python may warn during garbage collection.

~~~python
import asyncio

async def retrieve():
    await asyncio.sleep(0)
    return 42

# wrong = retrieve()   # not awaited; may produce a warning when discarded
result = asyncio.run(retrieve())
assert result == 42
~~~

## Match the surrounding event loop
Use await retrieve() inside another async function. At a synchronous command-line entry point without a running event loop, asyncio.run can drive the coroutine. Inside Jupyter or an already running async application, do not nest asyncio.run; await from the existing loop instead.

~~~python
async def combined():
    first = await retrieve()
    second = await retrieve()
    return first + second

assert asyncio.run(combined()) == 84
~~~

## Background tasks require ownership
create_task schedules a coroutine on the current loop, but the caller should retain and await or otherwise supervise the task and handle exceptions. Simply making a task to silence a warning can lose work at shutdown. In an asyncio.TaskGroup (on supported Python versions), child tasks are awaited as the group exits.

**Test:** verify the coroutine really performs its intended side effect or returns expected data, rather than merely confirming the warning disappeared. Documentation: https://docs.python.org/3/library/asyncio-task.html

## Keep task ownership explicit
An `async def` call *creates a coroutine object*; it does not run the body. Inside an async function, `await fetch()` waits for the result. If concurrent work is intended, `task = asyncio.create_task(fetch())` schedules it, but the caller must eventually await or otherwise manage cancellation and failure. A discarded task can lose an exception even when the original warning disappears. Test one successful operation and one exception path under `asyncio.run(main())`; check that all tasks complete before the loop shuts down.
