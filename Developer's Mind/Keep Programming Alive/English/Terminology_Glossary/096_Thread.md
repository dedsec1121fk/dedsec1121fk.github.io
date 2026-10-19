# Thread — shared state, locks and measurable concurrency

## Concept
Threads within one process often share address space and file descriptors. Scheduling can interleave reads and writes to shared state; a program is not race-free merely because it usually prints the expected value. An OS thread, Python thread and asyncio task are not interchangeable. CPU parallelism also depends on interpreter build, version and workload.

## Reproducible Python synchronization
~~~python
import threading

counter = 0
guard = threading.Lock()

def add_one():
    global counter
    for _ in range(1000):
        with guard:
            counter += 1

workers = [threading.Thread(target=add_one) for _ in range(2)]
for worker in workers:
    worker.start()
for worker in workers:
    worker.join()
assert counter == 2000
~~~
The assertion establishes the intended total after **both threads join**. Locking protects the read-modify-write operation. Without join, the main thread can inspect incomplete state. Removing the lock produces a race-prone design, but a single run that still outputs 2000 does not prove it safe.

## Failure analysis
1. Move the assert before join and observe why results can be incomplete.
2. Split the update into explicit read, pause and write steps **in a disposable experiment** to expose an interleaving bug; do not depend on one scheduler outcome.
3. Compare one coarse lock with a queue-based message-passing design. Record contention as thread count grows.
4. Test cancellation and shutdown: a worker that waits forever on I/O may block a non-daemon thread from terminating.
5. Explain why the CPython GIL, where present, does not protect multi-step application invariants. Do not assume identical GIL behavior across all Python builds.

## Completion evidence
Save Python version/build, platform, inputs, repeatable assertions and a concurrency trace. State which races were observed, which were only hypothesized and whether a sanitizer or stress tool was actually run.
