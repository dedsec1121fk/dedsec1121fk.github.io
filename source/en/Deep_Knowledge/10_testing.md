# Testing — examples, boundaries and invariant sweeps

## Scenario and acceptance criteria
A quantity normalizer must accept decimal digits representing 0 through 99 and reject absent, negative, fractional, textual or over-limit input. A test suite needs a normal example, both boundaries and invalid values, not a single happy path. Separately check the invariant for every valid integer in the small bounded domain.

## Executable lab — Python 3 standard library
Save the example as `10_testing.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
import unittest
def normalize_quantity(text):
    if not isinstance(text, str) or not text.isdecimal():
        raise ValueError("decimal digits required")
    n = int(text)
    if n > 99: raise ValueError("quantity too high")
    return n
class QuantityTests(unittest.TestCase):
    def test_examples(self):
        for text, expected in [("0", 0), ("7", 7), ("99", 99)]:
            with self.subTest(text=text):
                self.assertEqual(normalize_quantity(text), expected)
    def test_boundaries(self):
        for text in ["-1", "", "100", "1.2", "abc", None]:
            with self.subTest(text=text):
                with self.assertRaises(ValueError):
                    normalize_quantity(text)
    def test_invariant(self):
        for n in range(100):
            self.assertEqual(normalize_quantity(str(n)), n)
suite = unittest.defaultTestLoader.loadTestsFromTestCase(QuantityTests)
outcome = unittest.TextTestRunner(verbosity=0).run(suite)
assert outcome.wasSuccessful()
print("PASS unit tests")
~~~

## Technical explanation
Unit tests run pure logic without files or network. subTest reports which fixture failed while allowing the remaining samples to execute. The invariant sweep checks 100 inputs, but it is not a mathematical proof of correctness beyond this bounded domain. Integration tests additionally verify parsing, storage and UI contracts; a browser smoke test cannot replace unit assertions, and a mocked network transport cannot prove live service availability.

## Bounded practice
Introduce a regression bug by changing `n > 99` to `n > 100`; check whether the boundary test fails. Add non-ASCII decimal digits and decide whether Unicode digits are allowed or ASCII-only input is required. Create one integration test writing a report into TemporaryDirectory. Add a browser-level acceptance step that checks the visible error message when invalid input is submitted.

## Diagnostics and completion evidence
If a test passes only when run alone, search for leaked global state and shared test fixtures. If an assertion is intermittent, record the seed, timing and environment, then minimize the failing input. Report actually executed test counts and runner version, never '100% tested' from passing fixtures.
## Further engineering detail

Failure injection should assert the number of attempts as well as the final output. A temporary timeout can justify retrying an idempotent read, while a permanent validation error should stop immediately. Inject the failing dependency and clock so the test exercises the intended state transition without depending on real delays or public services.

[Deterministic failure injection and recovery assertions](#read:fieldnotes-en-50)
