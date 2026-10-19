def dfs(graph, start):
    seen, order, stack = set(), [], [start]
    while stack:
        node = stack.pop()
        if node in seen: continue
        seen.add(node); order.append(node)
        stack.extend(reversed(graph.get(node, ())))
    return order
assert dfs({'a':['b','c'],'b':['d']}, 'a') == ['a','b','d','c']
