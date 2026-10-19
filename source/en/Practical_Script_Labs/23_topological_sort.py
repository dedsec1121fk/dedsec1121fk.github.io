from collections import deque

def topological(dependencies):
    all_nodes = set(dependencies)
    for values in dependencies.values():
        all_nodes.update(values)
    degree = {x:0 for x in all_nodes}
    children = {x:[] for x in all_nodes}
    for node, needs in dependencies.items():
        degree[node] = len(set(needs))
        for dep in set(needs):
            children[dep].append(node)
    queue = deque(sorted(x for x in degree if degree[x]==0))
    ordered=[]
    while queue:
        node=queue.popleft();ordered.append(node)
        for nxt in sorted(children[node]):
            degree[nxt]-=1
            if degree[nxt]==0:
                queue.append(nxt)
    if len(ordered)!=len(all_nodes):
        raise ValueError('dependency cycle')
    return ordered

if __name__ == '__main__':
    result=topological({'test':['build'],'release':['test'],'build':[]})
    assert result.index('build')<result.index('test')<result.index('release')
    try:
        topological({'a':['b'],'b':['a']})
        raise AssertionError('cycle not detected')
    except ValueError:
        pass
    print(result)
