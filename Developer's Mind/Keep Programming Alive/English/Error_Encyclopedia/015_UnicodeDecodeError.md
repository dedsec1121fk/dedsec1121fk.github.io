# UnicodeDecodeError: decode bytes with a documented policy

## What fails and when
UnicodeDecodeError occurs when raw bytes cannot be interpreted using the chosen character encoding. File extensions and locale guesses do not establish an encoding contract. Never make invalid data disappear with errors='ignore' just to hide the exception: this can silently change identifiers, CSV cells and security-relevant text.

## Self-contained executable example
Save this as 015_UnicodeDecodeError.py and run `python3 015_UnicodeDecodeError.py`. The example checks both the error and a valid case.

~~~python
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as tmp:
    path = Path(tmp) / "sample.txt"
    path.write_bytes("café".encode("cp1252"))
    try:
        path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        print("bad byte offset:", exc.start)
    else:
        raise AssertionError("wrong encoding accepted")
    assert path.read_text(encoding="cp1252") == "café"
~~~

## Diagnostic sequence and safe repair
Inspect a small permitted hex sample of the source bytes, the producer specification and any BOM. Decode using the documented encoding. If inputs are mixed, detect formats with explicit metadata or reject ambiguous files; errors='replace' may be acceptable only for a clearly labeled lossy preview. For JSON from APIs, verify Content-Type and actual byte representation before blaming Python.

## Practical lab and boundary test
Encode the same word in UTF-8 and cp1252, compare their hex values and decode both correctly. Add a fixture with a truncated UTF-8 multibyte sequence and assert that strict decoding raises at a known offset.

## Recover bytes exactly, or label a lossy preview
If the producer's encoding is unknown, do not silently reinterpret bytes as Latin-1 just because it never raises. Python's surrogateescape can preserve otherwise undecodable bytes for a controlled round trip; the resulting text is not suitable for unrestricted display or interchange.

~~~python
raw = b'\xffA'
try: raw.decode('utf-8')
except UnicodeDecodeError as exc:
    assert exc.start == 0 and exc.end == 1
else: raise AssertionError('expected invalid UTF-8')
recovered = raw.decode('utf-8', errors='surrogateescape')
assert recovered.encode('utf-8', errors='surrogateescape') == raw
assert '\ufffd' in raw.decode('utf-8', errors='replace')
~~~

## Incident triage and acceptance criteria
Keep the original bytes, note the failing offset and ask for the producer's documented encoding. Decode with that encoding if established; otherwise quarantine the record or provide an explicitly lossy preview. For the mastery exercise, compare the bytes for café in UTF-8 and cp1252, then test a truncated UTF-8 sequence. Show that replacing invalid bytes changes the data, while surrogateescape preserves the exact original byte stream.
