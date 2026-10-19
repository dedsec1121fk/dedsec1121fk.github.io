# Python AssertionError — invariant failure versus production input validation

## Meaning and root cause
An assertion checks a programmer's assumption during testing or debugging. In Python, optimized execution using -O removes assert statements, including the evaluation of their condition. Do not authorize access, validate data, or enforce a resource limit using assert. A failing AssertionError from a unit test may signal a wrong expected result, an incorrect implementation, or a missing precondition.

## Corrective approach
Implement a parse_limit boundary that validates ASCII decimal text and a range of 1 to 100 with ValueError, independently of optimization. Assertion statements test the expected output but are not the implementation's safety mechanism. A small collection of bad values must remain rejected under both normal and optimized Python execution.

## Executable example
Save as assertion_lab.py.

~~~python
def parse_limit(text):
    if not text.isascii() or not text.isdecimal():
        raise ValueError('limit must contain ASCII decimal digits')
    value = int(text)
    if not 1 <= value <= 100:
        raise ValueError('limit must be between 1 and 100')
    return value

assert parse_limit('12') == 12
for bad in ('-1', '101', '1.5', ''):
    try:
        parse_limit(bad)
    except ValueError:
        pass
    else:
        raise AssertionError('invalid limit accepted: ' + bad)
print('PASS: validation always runs; assertions are only tests')
~~~

## Why this is different
The code uses text.isdecimal together with text.isascii so Unicode decimal-like characters outside ASCII do not silently become part of a configuration format. The input '0' parses as an integer but is outside the accepted range. The for loop raises AssertionError manually only if a rejected input unexpectedly succeeds; it is independent of Python's optimized assert removal.

## Exact validation
Run python3 assertion_lab.py and python3 -O assertion_lab.py. Both should print PASS, because bad inputs raise ValueError even when assertions are stripped. To observe the optimization distinction safely, run python3 -c 'assert False' and python3 -O -c 'assert False; print("assert skipped")' separately; the first must fail while the second prints a message.

## Guided experiments
Introduce a new bad value such as '٠' (Arabic-Indic digit) and explain why the documented ASCII-only contract rejects it. Record the precise call frame where a real AssertionError originated, inspect actual versus expected values, and never remove a failing test solely to make CI green. For untrusted input, choose explicit validation and typed exceptions.

**Reference:** https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement
