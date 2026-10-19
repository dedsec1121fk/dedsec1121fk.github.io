# CSV reporting: precise decimals and malformed input

The companion report.py groups CSV category and amount rows with decimal.Decimal. Decimal is essential when 0.10 plus 0.20 must equal exactly 0.30. The report function accepts a pathlib.Path and returns a mapping of category totals. The fixture creates temporary files only; it never reads personal expenses or modifies the project.

## Runnable companion-script test

Save as lab.py next to the companion script, then run python3 lab.py.

```python
from decimal import Decimal, InvalidOperation
from pathlib import Path
from tempfile import TemporaryDirectory
from report import report

with TemporaryDirectory() as d:
    path = Path(d) / "good.csv"
    path.write_text("category,amount\nfood,0.10\nfood,0.20\nrent,1.00\n", encoding="utf-8")
    totals = report(path)
    assert totals["food"] == Decimal("0.30")
    assert totals["rent"] == Decimal("1.00")
    for contents, error in [
        ("amount\n1\n", ValueError),
        ("category,amount\n,1\n", ValueError),
        ("category,amount\nfood,abc\n", InvalidOperation),
    ]:
        path.write_text(contents, encoding="utf-8")
        try:
            report(path)
            raise AssertionError("expected rejected CSV")
        except error:
            pass
print("PASS: decimal CSV report")
```

## Diagnosis and limitations

Both headers are required. Empty categories produce ValueError, while invalid amounts such as abc produce decimal.InvalidOperation. The test checks each negative case separately. The source permits negative values and non-finite numbers such as NaN: decide whether negatives represent refunds, but reject non-finite values before displaying totals. The program trims whitespace around categories without normalizing case, so Food and food are distinct. DictReader also requires an explicit policy for extra columns and malformed quoting. Rounding output to two places is not a substitute for validating the original amount.

## Further labs

1. Reject non-finite Decimal values with is_finite(). 2. Decide whether -2.00 is a refund and test the rule. 3. Test a quoted category containing a comma. 4. Decide whether categories are case-sensitive and verify the report. Evidence: PASS, exact 0.30 and three rejected fixtures.
