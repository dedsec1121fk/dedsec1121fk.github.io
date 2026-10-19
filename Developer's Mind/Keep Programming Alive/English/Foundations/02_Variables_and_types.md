# Variables and types — convert input before arithmetic

## Concept and intended result
A variable holds a reference to a value. In Python, the value has a type: `"12"` is text and `12` is an integer, so they are not interchangeable in arithmetic. Many command-line and form inputs arrive as strings. Here we define a deliberate conversion boundary: ASCII decimal digits only, no leading zeros except zero itself, and an upper bound of 50 units.

## Runnable Python 3 exercise
Save as `02_Variables_and_types.py` and run with Python 3. Predict the output before executing; every example has assertions and uses only local synthetic values.

~~~python
def parse_units(token):
    if type(token) is not str or not token.isascii() or not token.isdecimal():
        raise ValueError("ASCII decimal text required")
    if len(token) > 1 and token.startswith("0"):
        raise ValueError("no leading zeros")
    number = int(token)
    if number > 50: raise ValueError("limit 50")
    return number
count = parse_units("12")
label = "pieces"
assert count == 12 and type(count) is int
assert type(label) is str
assert f"{count} {label}" == "12 pieces"
for bad in ("03","-2","2.0","٢",True,"51"):
    try: parse_units(bad)
    except ValueError: pass
    else: raise AssertionError("bad text accepted")
print("PASS typed quantity conversion")
~~~

## Why this works
Converting `int(token)` without checking the input shape can accept forms that do not belong to the chosen user interface. The explicit ASCII rule rejects other Unicode numeral scripts; this is a product decision rather than a universal rule about all numeric writing systems. `type(token) is str` prevents True or an integer from being silently accepted as a string. The final f-string converts a validated integer into display text only when producing the label.

## Guided learner lab
Before executing, predict `"12" + "3"` and `12 + 3`, and explain why the first produces text rather than 15. Test '0', '50', '51', '03', '٢' and '-1'. Decide whether your real interface needs internationalized numeral input; if so, define a different parser explicitly instead of removing checks at random. Add one test proving that type(label) remains str.

## Diagnosing mistakes
TypeError often identifies a mismatch between values and operations, not a reason to stringify every value. If the user enters unexpected numerals, keep the original input and show the required format. Do not swallow errors and replace every invalid value with zero, because zero may mean something legitimate.
