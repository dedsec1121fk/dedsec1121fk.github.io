from itertools import islice

def batches(iterable, size):
    if size < 1:
        raise ValueError('size must be positive')
    it = iter(iterable)
    while True:
        batch = tuple(islice(it, size))
        if not batch:
            break
        yield batch

if __name__ == '__main__':
    assert list(batches(range(5),2)) == [(0,1),(2,3),(4,)]
    print(list(batches(range(7),3)))
