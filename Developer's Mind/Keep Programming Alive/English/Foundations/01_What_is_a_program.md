# What is a program? A testable input-to-output contract

## Concept and intended result
A program is a set of steps the computer executes using explicit input and rules. For a simple shop receipt, the inputs are a price in integer cents and an item quantity. The output is the total in cents. Decide the allowed domain before writing code: prices cannot be negative, and the quantity is a whole number from zero through 100. A syntactically valid multiplication can still be a wrong program if it quietly accepts negative amounts.

## Runnable Python 3 exercise
Save as `01_What_is_a_program.py` and run with Python 3. Predict the output before executing; every example has assertions and uses only local synthetic values.

~~~python
def total_cents(price_cents, count):
    if type(price_cents) is not int or price_cents < 0:
        raise ValueError("price must be nonnegative integer cents")
    if type(count) is not int or not 0 <= count <= 100:
        raise ValueError("invalid quantity")
    return price_cents * count
assert total_cents(125, 3) == 375
assert total_cents(125, 0) == 0
for inputs in ((-1,2),(100,-1),(100,101),(True,2)):
    try: total_cents(*inputs)
    except ValueError: pass
    else: raise AssertionError("invalid inputs accepted")
print("PASS input -> checked rule -> output")
~~~

## Why this works
The function isolates one calculation and returns a result rather than printing inside the logic. Its caller can display euros later, but the core keeps integer cents to avoid decimal rounding problems. The `type(...) is int` check intentionally rejects Boolean input, even though Python considers bool a subtype of int. Separate invalid input from a legitimate total of zero. Assertions express the expected behavior in a form a machine can check.

## Guided learner lab
Draw a three-box diagram for input, validation and output. Change the unit price to 149 cents and quantity to four; calculate 596 cents on paper before running. Predict outputs for quantity zero and the rejected cases. Add a maximum-price check and write one test on each side of its boundary. Keep the same result for the same input so the helper stays deterministic.

## Diagnosing mistakes
If the output seems incorrect, print or inspect the two inputs before multiplication and identify whether their units are cents or euros. If a program fails while another example runs, capture its exact input and traceback. A passing example is evidence for those cases, not proof of every possible input.
