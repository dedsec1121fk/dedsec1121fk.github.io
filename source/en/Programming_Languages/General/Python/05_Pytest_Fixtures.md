# Python testing: prove behavior with small independent fixtures

## The contract and its boundary
Consider a function that converts a user quantity into a nonnegative integer. Define the accepted domain before writing tests; parsing an arbitrary string is not the same as validating a quantity. Make invalid inputs raise a specific exception instead of returning a number that silently changes meaning. Tests should assert behavior, not implementation details such as local variable names.

~~~python
import pytest

def quantity(value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError('integer required')
    if value < 0:
        raise ValueError('negative quantity')
    return value

@pytest.mark.parametrize('value', [0, 1, 999])
def test_accepts_int(value):
    assert quantity(value) == value

def test_rejects_bool():
    with pytest.raises(TypeError):
        quantity(True)

def test_rejects_negative():
    with pytest.raises(ValueError):
        quantity(-1)
~~~

## Why the bool case matters
Python's bool subclasses int, so a naive `isinstance(True, int)` check accepts True as 1. If your data contract requires actual numerical quantities rather than flags, explicitly reject it. A property-based test can explore many values, but targeted boundary cases document the intended behavior for future maintainers.

## Separate unit tests from environment tests
The test above makes no network calls and modifies no persistent files. A test of filesystem import paths, real services or interpreter ABI belongs in another test layer with controllable setup. For tests involving temporary files, use pytest's `tmp_path` fixture to avoid changing the developer's current directory. Pin test dependencies and run the suite with the same interpreter as the application.

## Proof of completion
Before changing the validation rule, add a failing test that captures the new edge case. After the fix, demonstrate red → green and show exact test output, Python version and pytest version. No execution is claimed for the reader's platform by the text of this lesson.
