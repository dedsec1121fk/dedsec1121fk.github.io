def fibonacci(n):
    if n < 0: raise ValueError('n must be >= 0')
    a, b = 0, 1
    for _ in range(n): a, b = b, a + b
    return a
assert [fibonacci(n) for n in range(7)] == [0,1,1,2,3,5,8]
