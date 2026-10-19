import heapq

def merge(*inputs):
    return list(heapq.merge(*inputs))

if __name__ == '__main__':
    assert merge([1,4,8],[2,3,9]) == [1,2,3,4,8,9]
    print(merge([0,4,5],[2,3],[1,6]))
