# Unit-test fixtures and reproducibility

## What is happening
A good test specifies setup, action and expected observation. Use small deterministic inputs instead of relying on random output or live websites.

## Practical investigation
For code that talks to external services, mock the HTTP boundary. Unit tests should fail because your logic changed, not because a network provider is offline.

## Common traps
Test the error path as carefully as success. Preserve a regression test whenever you fix a bug found in production.

## Adaptable demonstration
```text
python -m unittest discover -v
```

## Make the negative case observable
~~~python
from tempfile import TemporaryDirectory
from pathlib import Path
import json

with TemporaryDirectory() as folder:
    path = Path(folder) / 'settings.json'
    path.write_text('{broken', encoding='utf8')
    before = path.read_bytes()
    try:
        json.loads(path.read_text(encoding='utf8'))
    except json.JSONDecodeError:
        pass
    else:
        raise AssertionError('malformed JSON was accepted')
    assert path.read_bytes() == before
~~~
This fixture checks both rejection and the preservation of the input. A test that only confirms an exception could miss code that corrupts the file before failing. Extend it with valid empty configuration, a Unicode value and a wrong-type top-level value. Parsing valid JSON does not imply the resulting configuration has the intended schema.

Keep mutable fixtures local to the test, not in a shared module-level list. Inject clocks and transport functions for expiry or network behavior. Assert the application's response and side effects rather than every internal helper call, so a harmless refactor does not require rewriting the whole suite.
