# Dijkstra — nonnegative weights and a lazy priority queue

## Python 3 reference program
~~~python
import heapq
def distances(graph, start):
    dist = {start: 0}; heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost != dist[node]: continue
        for neighbor, weight in graph.get(node, []):
            if weight < 0: raise ValueError('negative weight')
            candidate = cost + weight
            if candidate < dist.get(neighbor, float('inf')):
                dist[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return dist
assert distances({'a':[('b',3),('c',1)],'c':[('b',1)]},'a')['b'] == 2
~~~

## Invariant and graph format
The graph maps each node to a list of (neighbor, weight) edges. The heap prioritizes the smallest tentative distance. When a popped pair matches dist[node], that cost is the best known distance; old, larger heap entries are discarded as stale. This proof requires **nonnegative edge weights** on paths being explored.

## Read the result precisely
For edges a→b=3, a→c=1 and c→b=1, the shortest distance from a to b is 2, via c. The function returns **distances**, not the actual paths. Unreachable nodes are omitted from the dictionary. heapq uses tuple comparison: nodes with equal priority must be mutually comparable, or a tie-breaker counter is needed.

## Tests beyond the happy path
1. Add a self-loop with weight 0. Since candidate is not smaller than the current distance, it should not cause infinite updates.
2. Introduce a reachable negative edge. The implementation raises ValueError before relaxing it; this is a contract check, not support for negative-cost shortest paths.
3. Add a disconnected node with a negative edge. This implementation may never inspect that edge, so do not claim it validates the entire graph.
4. Make two equally short alternatives and verify the distance remains correct, without assuming an automatic deterministic predecessor.
5. For a missing start key, dist initially contains start:0. Record this behavior when the graph represents isolated vertices implicitly.

## Further engineering
To reconstruct paths, store predecessor on each successful relaxation. For graphs with negative weights, choose a different algorithm (such as Bellman–Ford with appropriate cycle handling). With a binary heap, complexity is commonly O((V+E)log V) for this lazy approach, with heap storage possibly proportional to relaxed edges.

## 10 dijkstra — boundary study

Dijkstra settles the lowest known tentative distance first. The priority queue may contain obsolete entries; `if cost != dist[node]: continue` discards them. Negative weights invalidate the greedy correctness argument.

Unreachable nodes remain absent from the returned distance map. Test zero-weight edges and a cheaper route that is discovered only after an initially expensive path.

<!-- [curated-algorithm-detail:10_dijkstra.md] -->
## Stale priority-queue entries in Dijkstra

Without a decrease-key operation, a common implementation pushes a new candidate whenever a shorter route is found. Old heap entries remain present. When popped, compare the candidate distance with the current best distance and skip stale entries. Otherwise the same vertex may expand repeatedly and the performance argument no longer matches the intended implementation.

Dijkstra requires nonnegative edge weights. Checking only the edges encountered from one chosen source may miss a negative edge elsewhere, so define whether validation covers the supplied graph or only the reachable subgraph. The fixture uses integer weights and verifies a later improvement over an earlier expensive route.

```python
import heapq
graph = {"a":[("b",9),("c",1)], "b":[], "c":[("b",2)]}
assert all(weight >= 0 for edges in graph.values() for _,weight in edges)
best = {"a":0}; heap = [(0,"a")]
while heap:
    cost,node = heapq.heappop(heap)
    if cost != best[node]: continue
    for nxt,weight in graph[node]:
        candidate = cost + weight
        if candidate < best.get(nxt,float("inf")):
            best[nxt] = candidate
            heapq.heappush(heap,(candidate,nxt))
assert best["b"] == 3
print(best)
```

Test zero-weight edges and disconnected vertices. If heap entries contain non-orderable node objects, add a monotonic tie-breaker instead of relying on comparisons between node objects. Avoid floating NaN weights, which can break the ordering assumptions.

[Technical reference](https://docs.python.org/3/library/heapq.html)
