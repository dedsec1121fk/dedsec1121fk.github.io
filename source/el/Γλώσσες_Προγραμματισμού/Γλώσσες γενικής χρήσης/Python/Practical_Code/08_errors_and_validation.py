def positive_int(raw: str) -> int:
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError("Not an integer") from exc
    if value <= 0:
        raise ValueError("Must be positive")
    return value

for raw in ("12", "-2", "banana"):
    try:
        print(raw, positive_int(raw))
    except ValueError as exc:
        print(raw, "=>", exc)
