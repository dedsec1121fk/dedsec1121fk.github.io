values = [4, 6, 2, 5]
prefix = [0]
for number in values: prefix.append(prefix[-1] + number)
def range_sum(left, right):
    if not (0 <= left <= right <= len(values)): raise ValueError('range')
    return prefix[right] - prefix[left]
assert range_sum(1, 3) == 8
