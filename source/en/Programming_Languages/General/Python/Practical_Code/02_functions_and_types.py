# Type hints help editors; Python does not enforce them at runtime
from collections.abc import Iterable

def total_prices(prices: Iterable[float], tax: float = 0.24) -> float:
    if tax < 0:
        raise ValueError("Tax must not be negative")
    return round(sum(prices) * (1 + tax), 2)

assert total_prices([5.0, 10.0], 0.20) == 18.0
print(total_prices([12.50, 7.50]))
