# Parsing and validation — bounded, explicit configuration grammar

## Problem and input contract
An offline CLI loads a tiny human-editable configuration of mode, limit and label. Treat file text as untrusted data; never execute it as shell code, Python, pickle or a template expression. Each allowed key may occur once. The only mode is read, the limit is an ASCII integer from 1 through 50, and label must be nonempty. Lines can be blank or full-line comments. Unknown keys, duplicates, oversized UTF-8 input and malformed key/value pairs must fail rather than being ignored. This exercise does not accept arbitrary nested structures, quoted multiline values or inline comments.

## Runnable Python 3 example
Save as config_lab.py and run python3 config_lab.py. The parser receives a string instead of a filesystem path, so all tests use synthetic inputs and no external file is read.

~~~python
import re

def parse_config(text):
    if len(text.encode('utf-8')) > 2048:
        raise ValueError('configuration too large')
    allowed = {'mode', 'limit', 'label'}
    result = {}
    for number, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            continue
        key, sep, value = stripped.partition('=')
        key = key.strip()
        value = value.strip()
        if not sep or not re.fullmatch(r'[a-z]+', key) or key not in allowed:
            raise ValueError(f'line {number}: bad or unknown key')
        if key in result:
            raise ValueError(f'line {number}: duplicate {key}')
        result[key] = value
    if result.get('mode') != 'read':
        raise ValueError('mode must be read')
    limit = result.get('limit')
    if limit is None or not re.fullmatch(r'[0-9]+', limit) or not 1 <= int(limit) <= 50:
        raise ValueError('limit must be integer 1..50')
    if not result.get('label'):
        raise ValueError('label must be nonempty')
    return {'mode': 'read', 'limit': int(limit), 'label': result['label']}

assert parse_config('# comment\nmode=read\nlimit=5\nlabel=Ελληνικά\n')['label'] == 'Ελληνικά'
for bad in ('mode=write\nlimit=1\nlabel=x', 'mode=read\nlimit=0\nlabel=x',
            'mode=read\nlimit=2\nlabel=', 'mode=read\nlimit=2\nlabel=x\nlimit=3',
            'mode=read\nlimit=2\nlabel=x\nexec=yes',
            'mode=read\nlimit=2\nlabel=x\n' + 'x'*2048):
    try: parse_config(bad)
    except ValueError: pass
    else: raise AssertionError('bad input accepted')
print('PASS parser: schema, Unicode, repeated keys, limits and size')
~~~

## Separate syntax from meaning
The partition operation identifies the first equal sign and does not itself determine whether a setting is authorized. The regular expression limits keys to lower-case ASCII letters, after which an explicit allowlist rejects unexpected names. The duplicate check prevents a later occurrence of a key from silently replacing an earlier decision. For the limit, syntax validation precedes integer conversion, and domain validation enforces the allowed interval. A missing limit, empty limit and malformed limit are distinct failure cases, although the function currently returns the same public error category for them. utf-8 byte size is checked before parsing to protect memory and CPU; line length and number of lines can be separately limited if this format expands. Never concatenate configuration text into shell commands.

## Tests, diagnostics and revision exercises
1. Add two settings with the same key; verify that the parser fails at the second line instead of accepting the last value.
2. Compare 0, 005, 51, -1, 1.5 and Arabic-Indic digits as limits. Explain the intentional ASCII-only numeric contract.
3. Add an unknown key named exec; prove that the parser rejects it rather than treating it as an instruction. Try values with equals signs and define the desired escaping policy.
4. Add a test for oversized UTF-8 Greek input, where byte length differs from character count. Then add distinct diagnostic identifiers for missing versus empty required fields.

**Completion evidence:** PASS, rejected fixtures, a documented grammar and clear statement of which syntax the parser intentionally does not support.
