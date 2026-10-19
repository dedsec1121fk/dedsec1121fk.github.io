# JSON settings: strict booleans and validation boundaries

The companion settings.py loads a UTF-8 JSON object and validates two required settings: language must be en or gr and autostart must be a JSON boolean. JSON false becomes Python False, while the number 1 is an int and must not be accepted as a substitute for true. Validate configuration before applying it, especially when startup behavior depends on a file. The fixture writes only to a temporary directory.

## Runnable companion-script test

Save as lab.py next to the companion script, then run python3 lab.py.

```python
from pathlib import Path
from tempfile import TemporaryDirectory
from settings import load

with TemporaryDirectory() as d:
    path = Path(d) / "prefs.json"
    path.write_text('{"language":"gr","autostart":false}', encoding="utf-8")
    assert load(path) == {"language": "gr", "autostart": False}
    for invalid in (
        "[]",
        '{"language":"en","autostart":1}',
        '{"language":"xx","autostart":false}',
        "{oops}",
    ):
        path.write_text(invalid, encoding="utf-8")
        try:
            load(path)
            raise AssertionError("invalid settings accepted")
        except ValueError:
            pass
print("PASS: JSON settings validation")
```

## Diagnosis and limitations

A valid Greek configuration passes. An array fails the top-level object check; autostart 1 fails strict bool validation; unsupported language xx fails the allowlist; malformed JSON fails parsing. JSONDecodeError inherits from ValueError, so one test handler covers both syntax and schema failures, although a production CLI should report them distinctly. The current loader allows unknown keys and Python's default JSON parser keeps the last occurrence of duplicate keys. It also reads the whole file without a size limit. Consider rejecting repeated security-sensitive settings, limiting bytes before decoding and redacting settings if secrets are ever added; the current CLI prints the dictionary.

## Further labs

1. Reject duplicate keys using json.loads(object_pairs_hook=...). 2. Choose a policy for unknown fields and test it. 3. Limit file bytes before reading and distinguish syntax from schema errors. 4. Avoid printing future secret values. Evidence: PASS and an accepted/rejected matrix of JSON values and types.
