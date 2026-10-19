# Greedy algorithms — optimal interval scheduling under clear assumptions

## Contract
Given a set of jobs represented by integer start and end times, select the maximum possible *number* of nonoverlapping jobs on one resource. Each job has unit value, start is strictly less than end, and the end of one job may equal the start of another. Under these assumptions, selecting the available job that finishes earliest is optimal. Sorting by earliest start instead is not: one long job can block several short jobs.

## Executable Python 3 example
Save as intervals_lab.py and run python3 intervals_lab.py. The first long interval begins earliest but is deliberately rejected in favor of three short jobs.

~~~python
def select(intervals):
    if any(type(s) is not int or type(e) is not int or s >= e
           for s,e in intervals):
        raise ValueError("invalid interval")
    chosen, end = [], None
    for start, finish in sorted(intervals, key=lambda pair:(pair[1],pair[0])):
        if end is None or start >= end:
            chosen.append((start,finish))
            end = finish
    return chosen

jobs = [(0,5),(1,2),(2,3),(3,4)]
assert select(jobs) == [(1,2),(2,3),(3,4)]
assert select([]) == []
try:
    select([(2,2)])
except ValueError:
    pass
else:
    raise AssertionError("empty interval accepted")
print("PASS: earliest finish and interval boundaries")
~~~

## Exchange argument and limitations
Let G be the earliest-finishing compatible job and O the first job of any optimal schedule. Replacing O with G cannot reduce the time left for subsequent jobs because G ends no later. Repeating the same argument constructs an optimal schedule with greedy first choices at every step. Sorting costs O(n log n), and scanning the sorted intervals costs O(n). The selected output is O(n) space. The proof does not extend to weighted job values, multiple resources or jobs with precedence constraints; those need different models.

## Bounded diagnostic exercises
1. Insert an interval whose start equals the prior selected end. Show why it is allowed under the half-open interval convention.
2. Add duplicate intervals, a zero-duration job and a negative-duration job. Decide whether to reject, deduplicate or count repeats.
3. Enumerate every subset for at most eight jobs and compare the best valid cardinality with the greedy result.
4. Assign weights to jobs and construct a counterexample where earliest finish selects a lower-value set than a weighted optimizer.

**Evidence:** PASS, the exchange argument in your own words, at least one invalid interval and one weighted counterexample.
