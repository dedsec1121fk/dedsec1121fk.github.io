# Reviewing generated code — independent business contracts and property checks

## A plausible but incorrect implementation
An assistant proposes a discount function that subtracts int(cents * percentage / 100), silently rounding every fractional-cent discount toward zero. It passes tests such as a 20% discount on 100 cents, yet violates a contract requiring half-up rounding of the discount. Start from the requirements independently of the suggested implementation: amounts are nonnegative integer cents, percentages are integers from 0 to 100, and discount rounding uses decimal ROUND_HALF_UP.

## Executable Python 3 review
Save as review_lab.py and run python3 review_lab.py. The example deliberately demonstrates one counterexample against the flawed implementation and then tests the corrected version over several hundred inputs.

~~~python
from decimal import Decimal, ROUND_HALF_UP

def wrong(cents, pct):
    return cents - int(cents * pct / 100)

def safe(cents, pct):
    if type(cents) is not int or cents < 0 or type(pct) is not int or not 0 <= pct <= 100:
        raise ValueError("bad input")
    discount = (Decimal(cents) * Decimal(pct) / 100).quantize(
        Decimal("1"), rounding=ROUND_HALF_UP)
    return cents - int(discount)

assert wrong(101, 50) == 51 and safe(101, 50) == 50
for pct in (0,25,50,100):
    assert all(safe(c,pct) <= safe(c+1,pct) for c in range(300))
assert safe(999,0) == 999 and safe(999,100) == 0
for args in ((True,50),(-1,25),(10,101)):
    try:
        safe(*args)
    except ValueError:
        pass
    else:
        raise AssertionError("bad input accepted")
print("PASS: independent rounding contract and properties")
~~~

## What the tests do and do not prove
At 101 cents and 50%, the flawed function returns 51 cents but the specified calculation returns 50. The property tests check monotonic behavior for a bounded set of amounts and discount rates, plus zero and full discount invariants. They do not constitute a mathematical proof over every integer or a compliance review of real-world taxes and promotions. Requiring exact types rejects bool despite its integer subclass relationship in Python. Review external dependencies, licensing, permission boundaries and unsafe subprocess or file operations separately.

## Bounded review process
1. Write the acceptance contract before consulting implementation output. Include sign, units, rounding mode, domain boundaries and the treatment of missing values.
2. Mutate the corrected code to use float and truncate; verify the smallest counterexample is caught by a regression assertion.
3. Add randomized tests with a fixed seed alongside deterministic edge cases. Compare both against a separately written reference rather than code copied from the proposal.
4. Review a proposed repository patch for changes outside its requested scope, new dependencies, exposed credentials and error paths before merging.

**Evidence:** PASS, the 101-cent counterexample, invariant outcomes and a compact code-review checklist. Passing these tests does not certify an unexamined generated project.
