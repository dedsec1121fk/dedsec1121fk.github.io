def max_window_sum(values, k):
    if k <= 0 or k > len(values): raise ValueError('invalid window')
    current = sum(values[:k]); best = current
    for right in range(k, len(values)):
        current += values[right] - values[right-k]
        best = max(best, current)
    return best
assert max_window_sum([1,3,2,5,1],2) == 7
