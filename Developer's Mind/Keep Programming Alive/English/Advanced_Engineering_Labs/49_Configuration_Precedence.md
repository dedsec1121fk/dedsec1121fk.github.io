# Configuration precedence and provenance

## Mechanism and contract

Configuration often combines defaults, a file, environment variables and command-line arguments. An implicit order makes a service difficult to debug: an operator edits the file while an old environment variable continues to win. Define the order once and expose the source of each effective non-secret setting, not just its final value.

Missing is different from empty, zero and false. A truthiness expression can accidentally replace a valid zero timeout or disabled feature with a default. Parse each layer into typed values, reject unknown names and then merge deliberately. Secrets need redacted diagnostics; displaying their length, prefix or source path can also leak information in some environments. The fixture uses integer settings only.

## Worked local example

```python
layers = [("default", {"retries":3, "timeout":10}),
          ("file", {"retries":2}), ("environment", {"timeout":5}),
          ("cli", {"retries":0})]
values, sources = {}, {}
for name, layer in layers:
    for key, value in layer.items():
        if key not in {"retries", "timeout"} or type(value) is not int or value < 0:
            raise ValueError("invalid configuration")
        values[key], sources[key] = value, name
assert values == {"retries":0, "timeout":5}
assert sources["retries"] == "cli"
print(values, sources)
```

## Failure checks and limits

Test an omitted setting, an explicit zero, malformed input and a typo in a key. Decide whether reload is atomic: readers should not observe half of an old configuration and half of a new one. Keep a validated immutable snapshot per operation when settings must stay consistent for its duration. Include schema versioning when configuration files survive application upgrades.

## Primary reference

[Official documentation](https://docs.python.org/3/library/argparse.html)
