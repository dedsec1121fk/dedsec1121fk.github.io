# ValueError: distinguish format, range and type

## What fails and when
ValueError usually means the type is acceptable but its value violates the operation's requirements. int('12x') accepts a string argument but not that string's content. Similarly, an out-of-range port number can be an int yet invalid. Validation should preserve the source of the bad value for a useful message without echoing secrets.

## Self-contained executable example
Save this as 007_ValueError.py and run `python3 007_ValueError.py`. The example checks both the error and a valid case.

~~~python
def parse_port(text):
    try:
        port = int(text, 10)
    except ValueError as exc:
        raise ValueError("port must be a decimal integer") from exc
    if not 1 <= port <= 65535:
        raise ValueError("port outside 1..65535")
    return port
assert parse_port("443") == 443
for invalid in ("abc", "0", "65536"):
    try:
        parse_port(invalid)
    except ValueError:
        pass
    else:
        raise AssertionError(invalid)
~~~

## Diagnostic sequence and safe repair
Separate parsing from semantic validation: first interpret input, then check its permitted domain. A broad except Exception clause would also swallow programming bugs; catch ValueError at the boundary you can handle. If zero, whitespace and signs have special meaning in your protocol, write those decisions down rather than relying on int() defaults.

## Practical lab and boundary test
Decide whether ' +80 ' is permitted and whether '80.0' should be rejected. Implement the policy without changing the accepted numeric range; test min, max, just below and just above.

## Strict port input: grammar before integer conversion
A permissive int() call accepts whitespace and signs. For a network configuration file that promises one to five ASCII digits, enforce that grammar before conversion; the length limit also bounds the work done on hostile input. Leading zeros are allowed here only while the total input remains at most five characters.

~~~python
def parse_port(text):
    if not isinstance(text, str):
        raise TypeError('port must be text')
    if len(text) > 5 or not text.isascii() or not text.isdecimal():
        raise ValueError('port must be 1..5 ASCII digits')
    port = int(text)
    if not 1 <= port <= 65535:
        raise ValueError('port outside 1..65535')
    return port

assert parse_port('080') == 80
assert parse_port('65535') == 65535
for bad in ('', '000080', '65536', '８０', '-1', ' 80 '):
    try: parse_port(bad)
    except ValueError: pass
    else: raise AssertionError(bad)
~~~

## Diagnosis and mastery check
If the conversion fails, distinguish an invalid character from an out-of-range number; do not log secret configuration values. Verify that '0' and '65536' are range failures, while '８０' and ' 80 ' are grammar failures. The exercise is complete when a test suite covers both bounds, non-ASCII digits, leading zeros, the empty string and non-string inputs, without catching unrelated exceptions.
