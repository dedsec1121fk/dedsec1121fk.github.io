# Depth-first search — explicit stack and reproducible order

## Python 3 reference program
~~~python
def dfs(graph, start):
    seen, order, stack = set(), [], [start]
    while stack:
        node = stack.pop()
        if node in seen: continue
        seen.add(node); order.append(node)
        stack.extend(reversed(graph.get(node, ())))
    return order
assert dfs({'a':['b','c'],'b':['d']}, 'a') == ['a','b','d','c']
~~~

## Mechanism
Depth-first search explores one branch before returning to pending neighbors. The adjacent Python source uses a LIFO stack rather than recursive calls. This avoids recursion-depth failure on long chains, although the explicit stack can still grow proportional to the number of vertices.

## Neighbor-order invariant
The reference appends reversed neighbors so that, when popped from the end, the leftmost listed neighbor is visited first. For a→b,c and b→d the expected traversal is a,b,d,c. Without reversed, the first pop after a would visit c. Order is a policy determined by the graph representation, not a universal DFS property.

## Test design
1. Add c→a to form a cycle: the seen set must prevent repeated visits.
2. Add duplicate edges a→b twice. The implementation may temporarily push duplicates, but the seen test must keep each vertex in output once.
3. Build a graph of 10000 nodes in a chain and compare iterative versus recursive implementations without claiming recursion is always safe.
4. Add a disconnected z: starting at a should not visit it. For a full graph traversal, iterate over all vertices and launch DFS for those not yet seen.
5. Change neighbor ordering deliberately and record the new traversal; assert membership separately from exact order when order is not required.

## When DFS is not enough
DFS does **not** guarantee minimum hop count. For cycle detection in directed graphs, a single seen set is insufficient: also track an active recursion/stack path or colors. Record O(V+E) traversal work with adjacency lists and a potentially O(V) seen/stack footprint.

## 07 dfs — boundary study

Iterative DFS stores work explicitly on a stack and avoids recursion depth limits. Its visitation order depends on adjacency ordering, and reversing neighbors on push is what makes the provided example visit the leftmost neighbor first.

Cycles are safe because already-seen nodes are skipped. Traversal order is not a shortest-path guarantee; for fewest hops use BFS.

<!-- [curated-algorithm-detail:07_dfs.md] -->
## Explicit DFS frames preserve recursive postorder

A stack of vertices is enough for reachability, but not always enough to reproduce a recursive DFS that performs work after all children finish. A frame must retain whether it is entering or leaving a vertex, or retain an iterator over unfinished children. Losing that state changes postorder-dependent algorithms.

The example traverses a tree and emits a node only on exit. For a general graph, add a visited set and, where needed, separate active-path state. A visited set prevents repeated work; active-path state answers whether an edge returns to the current recursion chain.

```python
children = {"a":["b","c"], "b":["d"], "c":[], "d":[]}
stack = [("a", False)]
postorder = []
while stack:
    node, exiting = stack.pop()
    if exiting:
        postorder.append(node)
    else:
        stack.append((node, True))
        stack.extend((child, False) for child in reversed(children[node]))
assert postorder == ["d","b","c","a"]
print(postorder)
```

Compare the iterative result with a recursive oracle on small generated trees. Test a deep chain to demonstrate why explicit frames avoid the interpreter recursion limit. A tree-only fixture is not evidence of correct cycle detection in an arbitrary directed graph.

[Technical reference](https://docs.python.org/3/library/stdtypes.html#lists)
