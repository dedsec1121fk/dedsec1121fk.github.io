# Validation — enforce rules at the trust boundary

## Definition versus parsing
Parsing answers whether some input can be interpreted as a value. Validation decides whether that value is permitted for a specific operation. A network port must be an integer from 1 through 65535, but an internal function should not silently accept a Python bool, string or float. At the command-line boundary, the contract can separately accept **ASCII decimal strings without leading zeroes** and convert them to validated integers.

## Executable Python 3 example
Save as validate_lab.py and run python3 validate_lab.py. The parser deliberately restricts input to ASCII 0–9 instead of using str.isdigit, which also accepts some non-ASCII numerals. Both the internal contract and the external string boundary have explicit negative tests.

~~~python
import re

def validate_port(value):
    if type(value) is not int or not 1 <= value <= 65535:
        raise ValueError('port must be integer 1..65535')
    return value

def parse_cli_port(raw):
    if not isinstance(raw, str) or not re.fullmatch(r'[1-9][0-9]{0,4}', raw):
        raise ValueError('ASCII decimal port with no leading zero required')
    return validate_port(int(raw))

assert validate_port(443) == 443
assert parse_cli_port('443') == 443
assert parse_cli_port('65535') == 65535
for wrong in (0, 65536, '443', True, 3.14):
    try: validate_port(wrong)
    except ValueError: pass
    else: raise AssertionError(f'invalid core value accepted: {wrong!r}')
for wrong in ('0', '65536', '0443', '+443', '-1', '٤٤٣', '443 ', '', None):
    try: parse_cli_port(wrong)
    except ValueError: pass
    else: raise AssertionError(f'invalid CLI text accepted: {wrong!r}')
print('PASS validation: internal type, untrusted ASCII CLI, bounds')
~~~

## Why two layers exist
validate_port checks an already parsed Python integer and rejects True, despite isinstance(True, int) normally succeeding, because a boolean is not semantically a port. parse_cli_port first enforces a lexical rule, so '+443', '0443', whitespace and Arabic-Indic digits are rejected. It then converts to integer and delegates range checking to the single authoritative internal validator. Do not assume a type annotation alone checks these conditions at runtime. When designing a public API, explicitly decide whether to allow Unicode digits, plus signs, leading zeroes and normalized input; do not let accidental library behavior define policy.

## Investigations with evidence
1. Change the accepted range to include 0 and explain when port zero is meaningful as an API request to select an ephemeral port rather than as a destination port.
2. Contrast raw.isdigit() with the ASCII regular expression using '٤٤٣'. Record why an internationalized UI might have a different requirement.
3. Test 65535 and 65536, True and 1, '0443' and '443'. Explain why similar representations do not necessarily share the same contract.
4. Introduce a second external boundary such as JSON and ensure it delegates to the internal validator without secretly redefining the port range.

**Evidence:** PASS output, five invalid internal values, nine rejected CLI strings and a published parsing policy.
