# Breadth-first search — shortest hop layers in an unweighted graph

## Python 3 reference program
~~~python
from collections import deque
def bfs(graph, start):
    seen, order, queue = {start}, [], deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, ()):
            if neighbor not in seen:
                seen.add(neighbor); queue.append(neighbor)
    return order
assert bfs({'a':['b','c'], 'b':['d']}, 'a') == ['a','b','c','d']
~~~

## Queue invariant
Breadth-first search removes the oldest discovered vertex first. A deque supports O(1) appends and pops from the left, so each vertex is processed once after being placed in seen. Mark vertices seen **on enqueue**, not only on dequeue, to avoid many duplicate entries when multiple parents lead to the same neighbor.

## Exactly what is guaranteed
With an adjacency list, visiting reachable vertices and their outgoing edges takes O(V+E) time and O(V) queue/seen space. BFS produces nondecreasing distance by edge count in an **unweighted** graph. The returned list is visitation order, not a shortest path; to reconstruct a path, store each vertex's parent when it is first discovered.

## Cases worth running
1. In graph a→b,c and b→d, the reference order is a,b,c,d because b and c are enqueued before d.
2. Add an edge d→a to form a cycle. The seen set prevents an infinite loop.
3. Ask to start from x where x is not a dictionary key. The defined behavior is ['x'], because missing adjacency defaults to an empty collection.
4. Insert an isolated vertex z. Starting at a will not visit z: breadth-first search does not automatically cover disconnected components.
5. Swap the order of a's neighbors. Visitation order may change while shortest edge-count distances stay the same.

## A practical extension
Return (distance, parent) mappings and verify that the parent chain for d consists of two edges. Compare BFS against Dijkstra only when every edge weight is one, and state how neighbor iteration order affects tie-breaking.

## 06 bfs — boundary study

Breadth-first search visits increasing numbers of edges from the start vertex. With an unweighted graph, the first time a vertex is reached gives a shortest path in hops. Mark it seen as you enqueue it, or multiple parents will enqueue duplicates.

A disconnected vertex absent from the starting component will not appear in traversal output. Test a cycle a→b→a to ensure the algorithm terminates.

<!-- [curated-algorithm-detail:06_bfs.md] -->
## Multi-source BFS and marking at enqueue time

Breadth-first search can start from several sources at distance zero. The first discovery of a vertex then gives its minimum number of edges from any source in an unweighted graph. Mark a vertex when you enqueue it, rather than when you later remove it; otherwise multiple predecessors can enqueue the same vertex repeatedly.

This technique models nearest exits, distance to any selected service and wavefront expansion. It does not handle different edge costs. A missing vertex in the distance map means unreachable from the chosen sources, not distance zero.

```python
from collections import deque
graph = {0:[1], 1:[0,2], 2:[1,3], 3:[2], 4:[]}
sources = [0,3]
distance = dict.fromkeys(sources, 0)
queue = deque(distance)
while queue:
    node = queue.popleft()
    for nxt in graph[node]:
        if nxt not in distance:
            distance[nxt] = distance[node] + 1
            queue.append(nxt)
assert distance == {0:0, 3:0, 1:1, 2:1}
assert 4 not in distance
print(distance)
```

Include duplicate sources, a self-loop, a disconnected component and a graph with multiple equally short paths. Parent selection among equal paths depends on traversal order, so do not claim a unique route unless the contract specifies tie-breaking.

[Technical reference](https://docs.python.org/3/library/collections.html#collections.deque)
