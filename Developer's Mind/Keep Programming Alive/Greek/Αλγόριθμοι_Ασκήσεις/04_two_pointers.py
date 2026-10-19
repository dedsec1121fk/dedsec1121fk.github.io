def pair_sum(values, target):
    i, j = 0, len(values) - 1
    while i < j:
        total = values[i] + values[j]
        if total == target: return (values[i], values[j])
        if total < target: i += 1
        else: j -= 1
    return None
assert pair_sum([1, 2, 4, 6, 8], 10) == (2, 8)
