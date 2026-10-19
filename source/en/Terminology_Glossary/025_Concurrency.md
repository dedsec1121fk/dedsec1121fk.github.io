# Glossary: concurrency, conditions and containers

## Concurrency

### Concept in practice
Concurrency means multiple tasks can make progress during overlapping periods; they need not execute simultaneously. Parallelism specifically means execution at the same time on multiple processing resources. Interleaved tasks can still share mutable state and create ordering hazards.

### Focused example
~~~python
import asyncio
async def job(i):
    await asyncio.sleep(0)
    return i * 2
async def main():
    return await asyncio.gather(job(1), job(2))
assert asyncio.run(main()) == [2, 4]
~~~

### Exercise and common pitfall
Verify that gather returns results in the same input order even if individual jobs complete at different times. Contrast cooperative I/O waits with CPU-heavy work that blocks the event loop; do not assume async code automatically runs on multiple CPU cores.

**Reference:** https://docs.python.org/3/library/asyncio-task.html

## Condition

### Concept in practice
A conditional chooses a branch using a predicate. Program correctness depends not just on truthiness but on the exact boundary conditions: greater-than differs from greater-than-or-equal, and `None`, empty strings or zero may be coerced to false in ways that obscure meaning.

### Focused example
~~~python
def shipping_cost(total):
    if total < 0: raise ValueError('negative total')
    if total >= 50: return 0
    return 5
assert shipping_cost(49.99) == 5
assert shipping_cost(50) == 0
~~~

### Exercise and common pitfall
Test exactly below, at and above the 50-unit threshold. Change the order of conditions and explain whether a negative input could be treated as a normal shipping price. Prefer explicit `is None` when missing data differs from numeric zero.

**Reference:** https://docs.python.org/3/tutorial/controlflow.html#if-statements

## Container

### Concept in practice
An application container packages processes with filesystem layers and runtime settings while relying on the host kernel for isolation. A container is not a virtual machine: it normally shares the host kernel, and its network, users, capabilities and mounts must be configured intentionally.

### Focused example
~~~sh
# On a machine with Docker and a trusted base image:
docker run --rm --network none --read-only alpine:3.20 sh -c 'id; uname -s'
~~~

### Exercise and common pitfall
On a supported host, compare `uname` inside and outside the container, then inspect which file writes fail with `--read-only`. Never mount your home directory or container engine socket just to make a demo succeed; such mounts change the security boundary.

**Reference:** https://docs.docker.com/engine/security/

## Coroutine

### Concept in practice
A coroutine is a computation whose execution can suspend and later resume. In Python, calling an `async def` function creates a coroutine object; it is not automatically executed to completion. An event loop orchestrates awaits and scheduled tasks.

### Focused example
~~~python
import asyncio
async def answer():
    await asyncio.sleep(0)
    return 42
assert asyncio.run(answer()) == 42
~~~

### Exercise and common pitfall
Try `created = answer()` without awaiting and inspect its type; then explicitly close it if the experiment does not await it, so no warning is leaked. Inside an already running event loop use `await`, not a nested `asyncio.run`.

**Reference:** https://docs.python.org/3/library/asyncio-task.html
