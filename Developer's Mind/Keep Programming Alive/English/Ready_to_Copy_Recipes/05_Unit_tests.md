# Recipe: executable regression suite with metamorphic properties

## Scenario and acceptance criteria
Clamp an integer into the inclusive range 0 through 10. A few example assertions cover obvious behavior, but a stronger check also verifies that every output is inside the bound and that increasing an input never lowers the output. These properties apply over a finite synthetic range and can reveal defects absent from a single happy-path test.

## Complete executable example
Save as `05_Unit_tests.py` and run with Python 3 and the standard library. The fixture works without internet or access to your real files.

~~~python
import unittest
def clamp(value, bottom=0, top=10):
    if type(value) is not int or bottom > top:
        raise ValueError("invalid domain")
    return min(top,max(bottom,value))
class ClampTests(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(clamp(-2),0)
        self.assertEqual(clamp(5),5)
        self.assertEqual(clamp(11),10)
    def test_invariant(self):
        for n in range(-100,101):
            with self.subTest(n=n):
                self.assertTrue(0<=clamp(n)<=10)
    def test_monotonicity(self):
        for n in range(-20,20):
            self.assertLessEqual(clamp(n),clamp(n+1))
    def test_invalid(self):
        with self.assertRaises(ValueError):
            clamp(True)
suite=unittest.defaultTestLoader.loadTestsFromTestCase(ClampTests)
result=unittest.TextTestRunner(verbosity=0).run(suite)
assert result.wasSuccessful()
print("PASS bounded clamp regression suite")
~~~

## Technical explanation
The method test_invariant sweeps 201 inputs while subTest preserves the identity of a failing value. The monotonicity test compares adjacent inputs, a simple metamorphic property that does not require knowing every exact result. The explicit `type(value) is int` check rejects True, even though bool inherits from int in Python. A suite that passes 201 cases does not prove correctness for unbounded arbitrary Python integers or for other parameter ranges.

## Bounded practice
Temporarily replace min(top,max(bottom,value)) with max(top,min(bottom,value)); identify the failing properties. Add a test with a custom bottom and top, and make sure invalid bounds are rejected. Run the suite under two compatible Python versions and document the exact environment. For mutation-testing practice, introduce one deliberate off-by-one error and ensure a retained test detects it.

## Diagnostics and safety
If one test fails only when running the full suite, investigate shared mutable fixtures or order-dependent setup. If the runner reports success but there is no assertion for a required boundary, the specification may still be untested. Keep negative and regression fixtures with the source rather than deleting them after a fix.
