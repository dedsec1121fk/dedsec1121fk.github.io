from collections import deque

def bfs(graph, start):
    seen, queue, output = {start}, deque([start]), []
    while queue:
        node = queue.popleft()
        output.append(node)
        for child in graph.get(node, []):
            if child not in seen:
                seen.add(child)
                queue.append(child)
    return output

if __name__ == '__main__':
    graph = {'a':['b','c'], 'b':['d'], 'c':['a'], 'd':[]}
    assert bfs(graph,'a') == ['a','b','c','d']
    print(bfs(graph,'a'))
