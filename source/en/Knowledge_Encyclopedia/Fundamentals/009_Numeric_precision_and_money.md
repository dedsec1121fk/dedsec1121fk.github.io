# Foundations — numeric precision, validation and complexity

## Numeric precision and money

### Problem and mental model
Binary floats cannot exactly represent every decimal fraction. Repeated rounding can produce totals that differ from legal or business expectations. Decide whether to use integer cents or Decimal with a documented rounding mode; never assume a formatted display string is suitable for further calculations.

### Reproducible illustration
~~~python
from decimal import Decimal, ROUND_HALF_UP
price = Decimal('19.99')
vat = Decimal('0.24')
total = (price * (1 + vat)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
assert total == Decimal('24.79')
print(total)
~~~

### Independent validation
Expected output: 24.79. Try three invoice lines and compare rounding each line with rounding at the final total. Test negative adjustments, quantity zero, and a currency with a different minor-unit convention. Document why your policy is reproducible.

**Authoritative documentation:** https://docs.python.org/3/library/decimal.html

## Parsing and validation

### Design principle and reasoning
Parsing turns text into structured values; validation determines whether those values satisfy domain rules. A syntactically valid JSON object may contain negative counts or unexpected keys.

### Study a concrete case
~~~python
import json
obj=json.loads('{"count":4}')
if set(obj)!={'count'} or type(obj['count']) is not int or obj['count']<0:raise ValueError()
assert obj['count']==4
~~~

### Independent exercise
Change JSON to a list, string count, boolean count and extra key. Separate JSONDecodeError from schema error.

### Evidence for review
For Parsing and validation, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Time complexity

### Mechanism and scope
Time complexity describes operation count as input size grows, not guaranteed milliseconds. Linear scan visits at most n items; nested full scans do n² comparisons. For small n, cache effects and setup can dominate.

### Implementation example
~~~python
def pair_count(n):
    return sum(1 for i in range(n) for j in range(n))
assert pair_count(10)==100
~~~

### Reproduce and investigate
Measure n=50,100,200 and count iterations rather than relying only on wall time. Compare growth factors with a one-loop function; account for measurement noise.

### Evidence to record
For Time complexity, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.

## Space complexity

### Mechanism and scope
Space complexity measures auxiliary memory relative to input size. Creating a full transformed list consumes O(n) extra space; yielding one transformed item at a time can have O(1) generator state when the consumer is streaming.

### Implementation example
~~~python
def squares(values):
    for n in values: yield n*n
assert list(squares(range(4)))==[0,1,4,9]
~~~

### Reproduce and investigate
Contrast list(squares(range(n))) against sum(squares(range(n))) and measure memory. A generator does not save memory if it is immediately materialized.

### Evidence to record
For Space complexity, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.
