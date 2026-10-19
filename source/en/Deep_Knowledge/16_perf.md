# Performance measurement — verify correctness before speed claims

## Scenario and acceptance criteria
Compare membership searches for a fixed workload with 400 indexed labels and 80 requested labels. Both implementations must produce exactly the same ordered output including repeated requests. Measure several runs using a monotonic high-resolution timer, report the median, and record peak allocation under tracemalloc. The purpose is disciplined measurement, not asserting one algorithm must always win.

## Executable lab
Save as `16_perf.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
from statistics import median
from time import perf_counter
from tracemalloc import start, stop, get_traced_memory
def linear(labels, wanted):
    return [name for name in wanted if name in labels]
def indexed(labels, wanted):
    keys = set(labels)
    return [name for name in wanted if name in keys]
labels = [f"k{i:04d}" for i in range(400)]
wanted = ["k0000","k0399","absent","k0000"] * 20
assert linear(labels, wanted) == indexed(labels, wanted)
def bench(fn, repetitions=7):
    samples=[]
    for _ in range(repetitions):
        t0=perf_counter()
        result=fn(labels,wanted)
        samples.append(perf_counter()-t0)
        assert result == linear(labels,wanted)
    return median(samples)
start()
before=get_traced_memory()[1]
linear_time=bench(linear)
indexed_time=bench(indexed)
peak=get_traced_memory()[1]-before
stop()
assert linear_time >= 0 and indexed_time >= 0
print("PASS representative result; median seconds:",
      round(linear_time,6),round(indexed_time,6),"peak delta:",peak)
~~~

## Technical interpretation
Time complexity predicts growth trends but not constants, CPU scheduling or memory allocation. A set has construction overhead and extra storage; a short list may be faster when reuse is low. Profiling changes timings too. Fix the dataset and check outputs before comparing medians. tracemalloc follows Python allocations, not necessarily total process RSS or device thermal behavior. Runs on a mobile CPU may behave differently because of heat and background tasks.

## Bounded experiments
Vary index size from 20 to 20,000 while keeping wanted fixed; explain where building a set becomes useful. Reuse the same prebuilt index for ten searches and separately measure index construction cost. Record seven timings per implementation and compare medians and spread, not a single number. On a phone, record interpreter version and device temperature if available.

## Diagnostics
If two algorithms produce different outputs, stop the timing comparison and repair semantics first. If timings vary widely, isolate other workloads, repeat samples and inspect garbage collection effects. Do not set hardcoded microsecond thresholds in the test suite, since hardware and environments vary.
