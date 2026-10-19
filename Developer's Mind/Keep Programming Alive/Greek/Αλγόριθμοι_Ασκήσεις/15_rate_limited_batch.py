def chunks(values, size):
    if size <= 0: raise ValueError('size')
    for start in range(0, len(values), size):
        yield values[start:start+size]
assert list(chunks(list(range(5)),2)) == [[0,1],[2,3],[4]]
