# Decimal rounding policies and reconciliation

## Mechanism and contract

A decimal representation avoids binary conversion surprises, but it does not choose a rounding policy for you. Construct Decimal from a decimal string when that string is the source of truth. Constructing it from a float preserves the float's existing approximation. Define precision, rounding mode and the stage at which rounding occurs as part of the data contract.

Rounding each line and then adding can differ from adding exact lines and rounding the total. Both calculations can be internally consistent while disagreeing. A reconciliation report should name the policy and retain enough original precision to explain differences. Currency, tax and accounting rules depend on context; this arithmetic lesson does not prescribe a legally correct policy.

## Worked local example

```python
from decimal import Decimal, ROUND_HALF_UP
cent = Decimal("0.01")
values = [Decimal("0.005"), Decimal("0.005")]
per_line = sum(v.quantize(cent, rounding=ROUND_HALF_UP) for v in values)
at_total = sum(values).quantize(cent, rounding=ROUND_HALF_UP)
assert per_line == Decimal("0.02")
assert at_total == Decimal("0.01")
print(per_line, at_total)
```

## Failure checks and limits

Include negative values, ties, very large magnitudes and division results in tests. Reject NaN and infinity where the business domain requires finite amounts; successful parsing alone is insufficient. Store the rounding rule with generated reports so a future rerun can explain the same cent-level result. Do not hide reconciliation differences by rounding displayed values while comparing unrounded totals.

## Primary reference

[Official documentation](https://docs.python.org/3/library/decimal.html)
