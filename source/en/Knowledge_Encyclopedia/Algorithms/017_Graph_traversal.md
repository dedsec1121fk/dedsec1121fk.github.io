# Graph traversal — cycle-safe breadth-first search

## Contract
A small offline dependency graph is represented as a mapping from every known node to its neighbors. Return a shortest path in *number of edges* between two existing nodes; return None when no route exists. Reject unknown start or goal nodes and dangling neighbor references. With unweighted edges, breadth-first search visits nodes in layers and can guarantee the minimum edge count. Dijkstra is needed when edge weights differ.

## Executable Python 3 lab
Save as bfs_lab.py and run python3 bfs_lab.py. The graph contains a cycle, two equally short choices, and a disconnected island. Neighbors are sorted to make tie-breaking deterministic for the fixture.

~~~python
from collections import deque

def shortest(graph, start, goal):
    if start not in graph or goal not in graph:
        raise ValueError("unknown node")
    pending = deque([(start, [start])])
    visited = {start}
    while pending:
        node, path = pending.popleft()
        if node == goal:
            return path
        for neighbor in sorted(graph[node]):
            if neighbor not in graph:
                raise ValueError("dangling neighbor")
            if neighbor not in visited:
                visited.add(neighbor)
                pending.append((neighbor, path + [neighbor]))
    return None

g = {"a":["c","b"],"b":["a","d"],"c":["a","d"],
     "d":["b","c"],"island":[]}
assert shortest(g,"a","d") == ["a","b","d"]
assert shortest(g,"a","island") is None
assert shortest(g,"a","a") == ["a"]
try:
    shortest(g,"ghost","a")
except ValueError:
    pass
else:
    raise AssertionError("unknown start accepted")
print("PASS: BFS shortest edges, cycles, no path")
~~~

## Invariants and complexity
Add a node to visited when it is *enqueued*, not when it is dequeued. That prevents two parents from repeatedly adding it and keeps the queue bounded. A FIFO deque ensures all paths with k edges are processed before paths with k+1 edges. Traversal visits each vertex and edge at most a constant number of times, O(V+E), assuming adjacency iteration is already available. This example sorts each adjacency list, adding sorting cost; the path-list copying also introduces extra work, so a production implementation for large graphs should track predecessor nodes and reconstruct the path once.

## Controlled failure cases
1. Add a self-loop and duplicate neighbors. Ensure the search terminates and returns the same shortest edge count.
2. Remove island's connections or the goal itself: distinguish no-path (None) from unknown-node (ValueError).
3. Replace the deque with a LIFO stack and find a graph where the first route is longer than the BFS answer.
4. For an undirected edge, verify the reverse edge is present. For directed graphs, explain why it need not be.

**Evidence:** PASS, queue/visited trace, one disconnected case and a written note on weighted edges and tie-breaking.
