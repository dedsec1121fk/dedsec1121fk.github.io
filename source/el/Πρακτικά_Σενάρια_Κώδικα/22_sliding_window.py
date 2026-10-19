from collections import deque

def moving_max(numbers, size):
    if size <= 0:
        raise ValueError('positive size required')
    queue, result = deque(), []
    for i, item in enumerate(numbers):
        while queue and queue[0] <= i - size:
            queue.popleft()
        while queue and numbers[queue[-1]] <= item:
            queue.pop()
        queue.append(i)
        if i >= size - 1:
            result.append(numbers[queue[0]])
    return result

if __name__ == '__main__':
    assert moving_max([1,3,2,5,4],3) == [3,5,5]
    print(moving_max([4,1,6,2,3],2))
