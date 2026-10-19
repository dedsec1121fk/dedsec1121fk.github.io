# Topological ordering — dependencies before dependents

## Python 3 reference source
~~~python
from collections import deque
def topological(graph):
    nodes = set(graph)
    for children in graph.values(): nodes.update(children)
    indegree = {node: 0 for node in nodes}
    for children in graph.values():
        for child in children: indegree[child] += 1
    queue = deque(sorted(node for node in nodes if indegree[node] == 0))
    order = []
    while queue:
        node = queue.popleft(); order.append(node)
        for child in graph.get(node, []):
            indegree[child] -= 1
            if indegree[child] == 0: queue.append(child)
    if len(order) != len(nodes): raise ValueError('cycle')
    return order
assert topological({'a':['b'], 'b':['c']}) == ['a','b','c']
~~~

## Graph contract and algorithm
A directed edge a→b means a must appear before b in the output. Kahn's algorithm first calculates every vertex's indegree, including nodes that appear only as children. Vertices with zero indegree enter a queue; removing one allows its outgoing neighbors to lose one incoming dependency. If not all vertices can be removed, a cycle exists and **no** topological order satisfies every edge.

## Important limitations
The reference initializes the queue from sorted zero-indegree nodes but later appends children in adjacency-list order. It does not promise a globally lexicographically minimal ordering. Its initial sorting also assumes node labels are comparable. Given a directed acyclic graph, a valid result need not be unique.

## Boundary tests
1. For a→b→c the only permitted order is [a,b,c].
2. Add c→a and expect ValueError('cycle'); a cycle must not be silently presented as a partial successful ordering.
3. Add an isolated vertex z. It must still appear once in the result if present as a graph key.
4. For independent tasks a and b leading to c, either a,b,c or b,a,c is valid if edge constraints hold.
5. Duplicate edges a→b are counted twice by indegree and both decremented during processing. Test whether that behavior matches your intended graph representation.

## Apply it
Use ordering to plan offline build steps or migrations where a dependency must finish before the next task starts. Run a verification loop over every edge and assert position[parent] < position[child]. A topological order alone does not execute jobs or guarantee successful completion.

## 11 topological sort — boundary study

Topological order is possible only for a directed acyclic graph (DAG). A queue receives vertices with in-degree zero; removing one reduces the in-degree of its successors. If fewer vertices are output than exist, a cycle prevents completion.

A graph may have several valid topological orders; do not hardcode a single sequence for independent nodes. Verify each dependency appears before its dependent node.

<!-- [curated-algorithm-detail:11_topological_sort.md] -->
## Diagnose a dependency cycle instead of returning a partial order

Kahn's algorithm repeatedly removes vertices of indegree zero. If the queue empties before every vertex is emitted, the remaining subgraph contains a cycle. Returning the emitted prefix as if it were a complete valid build order hides an unsatisfied dependency.

The leftover set can include vertices blocked behind a cycle as well as vertices directly on the cycle. Therefore it is useful diagnostic evidence but not necessarily the exact cycle. An additional DFS or strongly connected component analysis is needed to provide a precise cycle witness.

```python
from collections import deque
graph = {"a":["b"], "b":["a","c"], "c":[], "free":[]}
indegree = dict.fromkeys(graph,0)
for edges in graph.values():
    for node in edges: indegree[node] += 1
queue = deque(n for n,d in indegree.items() if d == 0); order=[]
while queue:
    node=queue.popleft(); order.append(node)
    for nxt in graph[node]:
        indegree[nxt] -= 1
        if indegree[nxt] == 0: queue.append(nxt)
blocked = set(graph) - set(order)
assert order == ["free"] and blocked == {"a","b","c"}
print("cycle blocks",sorted(blocked))
```

Add a self-dependency and a valid disconnected DAG. Explain whether parallel ready tasks are ordered lexically or by original input order. Never label every blocked vertex a cycle member without producing the necessary graph evidence.

[Technical reference](https://docs.python.org/3/library/graphlib.html)
