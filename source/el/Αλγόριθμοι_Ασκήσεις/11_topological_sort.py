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
