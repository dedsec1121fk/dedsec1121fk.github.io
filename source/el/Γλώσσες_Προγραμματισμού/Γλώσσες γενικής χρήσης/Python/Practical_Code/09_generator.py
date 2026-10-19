from collections.abc import Iterator

def squares(limit: int) -> Iterator[int]:
    for n in range(limit):
        yield n * n

print(list(squares(6)))
