def binary_search(items, target):
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] < target: lo = mid + 1
        else: hi = mid
    return lo if lo < len(items) and items[lo] == target else -1
assert binary_search([1, 3, 5, 7], 5) == 2
