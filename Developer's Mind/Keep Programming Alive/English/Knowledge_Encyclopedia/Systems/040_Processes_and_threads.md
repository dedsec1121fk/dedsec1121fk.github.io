# Processes, threads, races and locks

## Processes and threads

**Track:** Systems

### Core explanation

Processes generally have independent memory spaces, whereas threads within a process share memory. Concurrency helps responsiveness but introduces coordination and lifecycle problems.

### Hands-on application

Contrast one worker process with two threads modifying shared counters.

### How the system actually behaves
A process has its own address space and operating-system resource table; threads within one process share memory but have independent execution stacks. Threads help coordinate blocking I/O, while CPU parallelism depends on language runtime and platform. Python's common CPython GIL does not make compound state updates a safe protocol.

### Runnable controlled experiment
```python
import threading
seen=[]
def record(x): seen.append(x)
threads=[threading.Thread(target=record,args=(i,)) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
assert sorted(seen)==[0,1,2]
```

### Failure analysis and extension
Replace list appends with a compound read/modify/write state operation, then enforce the invariant with a Lock. Compare thread scheduling with a multiprocessing.Queue where data must cross a process boundary.

**Reference:** https://docs.python.org/3/library/threading.html

## Race conditions and locks

**Track:** Systems

### Core explanation

A race occurs when correctness depends on unpredictable event ordering. Prefer message passing or immutability where possible; locks require a documented acquisition order to avoid deadlocks.

### Hands-on application

Explain why read-increment-write is not automatically atomic.

### How the system actually behaves
A race condition means correctness depends on unpredictable interleaving. Protect an invariant with one lock spanning the entire read-modify-write critical section, not separate locks around reads and writes. A mutex makes an operation exclusive but excessive locking can cause contention or deadlock.

### Runnable controlled experiment
```python
import threading
counter=[0]; lock=threading.Lock()
def increment():
    for _ in range(1000):
        with lock: counter[0]+=1
threads=[threading.Thread(target=increment) for _ in range(2)]
for t in threads:t.start()
for t in threads:t.join()
assert counter[0]==2000
```

### Failure analysis and extension
Introduce a second lock and describe a lock-order inversion that would deadlock. Repair by imposing a global acquisition order; avoid testing deadlocks without a timeout and disposable process.

**Reference:** https://docs.python.org/3/library/threading.html#lock-objects
