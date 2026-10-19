# Conditions — mutually exclusive branches at exact boundaries

## Concept and intended result
A condition chooses which instructions execute. A learner receives retry for scores below 50, passed for 50 through 89 and excellent for 90 through 100. These ranges must not overlap or leave gaps, and invalid scores must be rejected before classification. `if`, `elif` and a final `return` express the mutually exclusive paths directly.

## Runnable Python 3 exercise
Save as `03_Conditions.py` and run with Python 3. Predict the output before executing; every example has assertions and uses only local synthetic values.

~~~python
def outcome(score):
    if type(score) is not int or not 0 <= score <= 100:
        raise ValueError("score must be 0..100")
    if score >= 90:
        return "excellent"
    elif score >= 50:
        return "passed"
    return "retry"
assert [outcome(x) for x in (0,49,50,89,90,100)] == [
    "retry","retry","passed","passed","excellent","excellent"]
for bad in (-1,101,50.5,True):
    try: outcome(bad)
    except ValueError: pass
    else: raise AssertionError("invalid score accepted")
print("PASS branch and boundary checks")
~~~

## Why this works
Python evaluates conditions from top to bottom. If the 50-point threshold were checked first, a score of 95 would return passed rather than excellent. The type check rejects True and fractional values so scores remain within the stated integer domain. The test matrix includes the exact values on both sides of each threshold. The operator `==` compares values; `=` assigns a name and cannot replace it inside an ordinary Python condition.

## Guided learner lab
Write a table for 49, 50, 89 and 90 before executing. Reverse the two if statements and describe the mistake. Add a new 70–89 'good' category without changing existing results for 0–49, 50–69 and 90–100. For each added boundary provide at least two assertions, immediately below and at the threshold.

## Diagnosing mistakes
A surprising classification is often caused by branch order or a missing validation boundary. Inspect the exact score type and each comparison. Avoid broad except blocks that return retry for malformed input: retry is a legitimate classification, not a synonym for errors.
