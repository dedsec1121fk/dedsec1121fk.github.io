# Numeric precision — exact totals and explicit rounding

## Acceptance contract
A local payment export accepts nonnegative decimal strings with one to three fractional digits. It displays a total with exactly two fractional digits, using ROUND_HALF_EVEN and rounding once after the sum, not once on every line. Values such as NaN, Infinity, negative amounts, exponent notation and empty tokens are invalid. The input schema and rounding step must be documented before calculating financial figures.

## Executable Python 3 investigation
Save the following as precision_lab.py and run python3 precision_lab.py. The standard decimal library works on original decimal text rather than intermediate floating-point values. Assertions compare line-by-line rounding with rounding the entire total.

~~~python
from decimal import Decimal, InvalidOperation, ROUND_HALF_EVEN, ROUND_HALF_UP
import re
CENT = Decimal('0.01')
def rounded_total(values):
    total = Decimal(0)
    for token in values:
        if not isinstance(token, str) or not re.fullmatch(r'[0-9]+\.[0-9]{1,3}', token):
            raise ValueError('unsupported monetary input')
        total += Decimal(token)
    try:
        return total.quantize(CENT, rounding=ROUND_HALF_EVEN)
    except InvalidOperation as error:
        raise ValueError('amount outside active decimal precision') from error
assert rounded_total(['0.10', '0.20']) == Decimal('0.30')
assert rounded_total(['0.015'] * 3) == Decimal('0.04')
assert sum((Decimal('0.015').quantize(CENT, rounding=ROUND_HALF_EVEN) for _ in range(3)), Decimal(0)) == Decimal('0.06')
assert Decimal('1.005').quantize(CENT, rounding=ROUND_HALF_UP) == Decimal('1.01')
for bad in ('NaN', 'Infinity', '-2.00', '2e3', ''):
    try: rounded_total([bad])
    except ValueError: pass
    else: raise AssertionError('bad token accepted: ' + bad)
print('PASS precision: exact sum, rounding order, bad values')
~~~

## Explain the disagreement
A binary float cannot represent every decimal fraction exactly: in Python, 0.1 + 0.2 is not exactly equal to 0.3. Decimal constructed from a string preserves the stated decimal value; Decimal constructed from a float inherits that float's approximation. Three values of 0.015 add to 0.045. Under ROUND_HALF_EVEN, rounding the sum gives 0.04, while rounding each input to 0.02 first produces 0.06. Which order is legally appropriate depends on the actual invoice or tax specification; no single policy fits every domain. ROUND_HALF_UP produces 1.01 for 1.005, whereas HALF_EVEN produces 1.00.

## Bounded exercises and diagnostics
1. Compare Decimal('0.1') and Decimal(0.1). Explain why the latter imports an approximate binary representation.
2. Test 0.00, 000.001, a missing token and a list with no amounts. State the explicit expected output or rejection for each.
3. Change the rounding rule to HALF_UP and record examples where it changes the final number. Document the policy rather than silently choosing one.
4. Pass a very long decimal number, catch precision-limit errors and record the active decimal context instead of truncating unnoticed.

**Evidence:** PASS output, a line-rounding versus total-rounding table, all five invalid fixtures, and the exact input validation contract.
## Further engineering detail

Reconciliation requires specifying where rounding happens. Summing rounded line items and rounding a sum of exact items can disagree without either arithmetic implementation being defective. Preserve original decimal inputs and the selected rule so a report can explain the difference rather than hiding it with display formatting.

[Decimal rounding policies and reconciliation](#read:fieldnotes-en-42)
