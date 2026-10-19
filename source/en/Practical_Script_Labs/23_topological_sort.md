# Topological ordering — enforce build prerequisites and reject cycles

## A realistic dependency graph
An offline build pipeline can release an artifact only after its tests pass, and tests can run only after the build. Represent each stage as a node and list its prerequisites. A valid topological order places every prerequisite before the dependent stage. The existing function uses indegree counts and a queue, sometimes called Kahn's algorithm. It rejects cycles rather than returning an incomplete order, which prevents silently skipping mandatory build steps.

**Working source:** 23_topological_sort.py. Run python3 23_topological_sort.py and then execute the following independent test from the same directory. The example verifies precedence without assuming one arbitrary ordering for unrelated nodes.

## Executable tests of four contracts
~~~python
from runpy import run_path
topological = run_path("23_topological_sort.py")["topological"]
order = topological({
    "release": ["test"], "test": ["build"], "build": []
})
assert order.index("build") < order.index("test") < order.index("release")
assert topological({"release": ["test"]}) == ["test", "release"]
assert topological({}) == []
try:
    topological({"a": ["b"], "b": ["a"]})
except ValueError:
    pass
else:
    raise AssertionError("dependency cycle accepted")
print("PASS dependency order, inferred node, empty input and cycle")
~~~

## Read the implementation, not just the result
The source derives all nodes from both dictionary keys and referenced dependencies. This means topological({'release':['test']}) implicitly creates a node named test even though the caller did not explicitly register it. In a permissive system this may be convenient; in a build orchestrator it may conceal a misspelled or missing task definition. The current code uses sorted queues and sorted children to produce stable ordering for comparable string keys. Its general time complexity is O(V + E) ignoring sorting; the extra sorting adds comparison costs and is justified only if deterministic tie-breaking is required.

## Failure-oriented exercises
1. Add a standalone lint node to the graph and check that the output keeps all nodes, even when multiple topological orders exist.
2. Introduce a cycle build -> test -> build and verify the error. Explain why returning a partial list could skip a critical stage.
3. Deliberately misspell a dependency (for example biuld). Observe its implicit inclusion. Implement a strict alternative that rejects referenced nodes absent from the dictionary.
4. Repeat an identical prerequisite twice. Explain why set(needs) deduplicates it for indegree calculation, and discuss whether a user-facing validator should instead reject duplicates.
5. Generate a deep chain of a thousand stages; verify each dependency appears before its child without exhaustively comparing every pair.

**Evidence:** PASS, a cycle rejection, one test of undeclared dependencies, and an explicit policy on missing tasks and tie-breaking.
