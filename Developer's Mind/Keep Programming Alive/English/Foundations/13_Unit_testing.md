# Unit tests and regression checks

A test asserts expected behavior for representative cases and edge cases. In DedSec, static tests avoid importing dangerous or stateful scripts merely to check syntax. Use isolated temporary directories and fakes for network or file access.

## Worked example

```text
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
```

## Practice

Add a test for add(0, 0).

## Corrected result / hint

assert add(0, 0) == 0.

## Write tests that can fail for the right reason
A useful test has a clear input, expected output and reason it would fail. Test the normal case, both boundaries, empty input and invalid type separately. `unittest` is included with Python:
```python
import unittest
def clamp(v,lo,hi):
    if lo>hi: raise ValueError("bounds reversed")
    return min(hi,max(lo,v))
class ClampTests(unittest.TestCase):
    def test_inside(self): self.assertEqual(clamp(5,0,10),5)
    def test_lower(self): self.assertEqual(clamp(-1,0,10),0)
    def test_invalid(self):
        with self.assertRaises(ValueError): clamp(0,4,2)
if __name__=="__main__": unittest.main()
```
A regression test should fail against the known broken behavior, then pass against the fix. Mock a network client at your own application's boundary rather than depending on a live service.

**Exercise:** intentionally change `max(lo,v)` to `min(lo,v)` and observe which test catches it; add one that detects it if none does.

## Mutation lab: a test must detect a broken rule

~~~python
import unittest
def clean(s):
    if not isinstance(s, str):
        raise TypeError("text required")
    return s.strip().casefold()
class Checks(unittest.TestCase):
    def test_name(self):
        self.assertEqual(clean(" Ada "), "ada")
    def test_blank(self):
        self.assertEqual(clean("  "), "")
    def test_type(self):
        with self.assertRaises(TypeError):
            clean(None)
if __name__ == "__main__":
    unittest.main()
~~~

Run the fixture in a scratch `test_clean.py`, then remove `strip()` temporarily. The test of `" Ada "` must fail. Restore the function and confirm green again. This is a mutation check: if deliberately breaking a feature leaves tests green, a passing suite may be misleading. Add a non-ASCII name and a regression fixture for an earlier bug. Keep external services and clocks out of the unit-test boundary. Documentation: https://docs.python.org/3/library/unittest.html
