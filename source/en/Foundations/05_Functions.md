# Functions — named inputs, default values and a rounding policy

## Concept and intended result
A function lets you reuse a calculation without copying it into multiple screens. Here apply_discount receives integer cents and an optional whole-number percentage from zero through 100. If the caller omits the discount, the default is zero. The return value is the discounted total in integer cents rather than a printed message, making the helper straightforward to test and use from a terminal or UI.

## Runnable Python 3 exercise
Save as `05_Functions.py` and run with Python 3. Predict the output before executing; every example has assertions and uses only local synthetic values.

~~~python
def apply_discount(total_cents, percentage=0):
    if (type(total_cents) is not int or total_cents < 0 or
            type(percentage) is not int or not 0<=percentage<=100):
        raise ValueError("invalid price or discount")
    # Explicit round-down of fractional cents.
    return total_cents*(100-percentage)//100
assert apply_discount(1000) == 1000
assert apply_discount(1000,25) == 750
assert apply_discount(101,50) == 50
assert apply_discount(500,100) == 0
for p in (-1,101):
    try: apply_discount(100,p)
    except ValueError: pass
    else: raise AssertionError("bad percentage accepted")
print("PASS function contract and default arguments")
~~~

## Why this works
The expression multiplies before dividing and uses integer floor division to discard fractional cents. That is an explicitly chosen round-down policy: 101 cents with a 50% discount becomes 50 cents, not 51. The policy is not automatically suitable for every merchant or jurisdiction; an application must document its rounding rule. Avoid mutable lists or dicts as default arguments because Python creates default values once at function definition time.

## Guided learner lab
Predict results for 1000 cents at 25%, 101 cents at 50% and 500 cents at 100%. Add a test that passing no percentage equals passing zero. Introduce a separate tax function instead of mixing tax policy into the discount helper. Test different rounding policies on odd-cent totals without silently changing existing behavior.

## Diagnosing mistakes
If callers see None, check that the function returns a value on every valid branch rather than printing. If totals differ by one cent, inspect multiplication and division order and the explicit rounding decision. Keep user-facing formatting separate from business arithmetic.
