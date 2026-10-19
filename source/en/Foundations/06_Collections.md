# Collections — keep order, count repetitions and build uniqueness

## Concept and intended result
Lists, dictionaries and sets answer different questions. In a user-selected list of names, order and duplicates may matter. A frequency dictionary counts how often each name occurs. A unique-name list can preserve only the first appearance of each name. A plain set loses meaningful occurrence information and should not automatically replace the original list.

## Runnable Python 3 exercise
Save as `06_Collections.py` and run with Python 3. Predict the output before executing; every example has assertions and uses only local synthetic values.

~~~python
def catalog(names):
    if not isinstance(names, list) or not all(type(x) is str and x for x in names):
        raise ValueError("list of nonempty names required")
    counts = {}
    for name in names:
        counts[name] = counts.get(name, 0) + 1
    unique_first_seen = list(dict.fromkeys(names))
    return unique_first_seen, counts
unique, counts = catalog(["Ada","Grace","Ada","Αθηνά"])
assert unique == ["Ada","Grace","Αθηνά"]
assert counts == {"Ada":2,"Grace":1,"Αθηνά":1}
assert catalog([]) == ([], {})
try: catalog(["ok",None])
except ValueError: pass
else: raise AssertionError("wrong element type accepted")
print("PASS ordered collection and frequency map")
~~~

## Why this works
The code loops through the list once to build counts and uses dict.fromkeys to preserve first-seen order in supported modern Python versions. The dictionary provides expected efficient key lookup, while the list preserves display order. Unicode text such as Αθηνά works as a dictionary key. Empty input returns two empty containers without being confused with invalid elements; None is rejected by the stated schema.

## Guided learner lab
Add one extra Ada and predict the count without running. Change the order of names and confirm the frequency dictionary stays the same while unique_first_seen changes. Compare `set(names)` with the ordered unique list; write down which requirement gets lost. Try a list containing an integer, empty string and a tuple instead of a list, and record the rejection.

## Diagnosing mistakes
If `KeyError` occurs when counting, use counts.get(name,0) rather than assuming the key exists. If duplicates disappear unexpectedly, find where a list was converted to a set. Avoid relying on a set's iteration order to present user-facing results; preserve an explicit order when the interface needs one.
