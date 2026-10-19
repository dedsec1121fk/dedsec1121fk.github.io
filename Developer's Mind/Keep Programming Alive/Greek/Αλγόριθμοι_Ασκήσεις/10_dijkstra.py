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
