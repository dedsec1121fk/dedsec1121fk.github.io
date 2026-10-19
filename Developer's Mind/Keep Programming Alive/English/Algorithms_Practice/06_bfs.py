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
