from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 0:
        raise ValueError('n >= 0 required')
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

if __name__ == '__main__':
    assert fibonacci(10) == 55
    print(fibonacci.cache_info())
