def find_index(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1
assert find_index([4, 8, 2], 8) == 1
assert find_index([], 8) == -1
