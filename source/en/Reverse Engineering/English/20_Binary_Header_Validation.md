# Understand a binary structure before opening it in a disassembler

## Start with a synthetic file you own
A file signature is evidence of a possible format, not proof that all later fields are valid. Create a test fixture with a four-byte marker, an unsigned little-endian length and a UTF-8 payload. The fixed-width header is 8 bytes; an offset points to the first byte after that header. Never trust a declared payload size without checking how many bytes actually remain.

~~~python
from struct import pack, unpack_from
blob = b"DEMO" + pack("<I", 3) + b"cat"
assert blob[:4] == b"DEMO"
length = unpack_from("<I", blob, 4)[0]
assert length <= len(blob) - 8
assert blob[8:8+length] == b"cat"
~~~

## Generate two failure fixtures
Truncate the last byte and confirm a parser rejects the payload before attempting to decode it. Then replace the header length with a very large number; do not allocate that size. Checking the declared length against the actual file size prevents both out-of-range slicing assumptions and uncontrolled memory requests. A parser that returns an empty slice for invalid data may silently hide corruption.

## Separate observation from inference
In a hex viewer, record the first 16 bytes and mark each field's offset, width, signedness and byte order. If an unknown binary starts with ELF, PE or ZIP-like bytes, inspect it with a read-only tool appropriate for that format and compare the claim with actual structural offsets. Do not execute samples of unknown provenance just to “see what happens.”

## Lab deliverable
Produce a field table for the synthetic example, three fixture hashes, expected accept/reject results and a precise error code for truncation. A useful reverse-engineering note should include the bytes that support every structural claim, not simply identify a recognizable magic number.

## Turn observations into a parser contract
This format contains exactly one record. Reject a truncated header, a bad marker, a length beyond the byte buffer, invalid UTF-8 and trailing bytes. An upper size bound limits decoded text, but a file reader must also enforce its own input-byte limit before loading a large file.
~~~python
from struct import pack, unpack_from

def parse_record(blob):
    if len(blob) < 8:
        raise ValueError('short header')
    if blob[:4] != b'DEMO':
        raise ValueError('bad magic')
    length = unpack_from('<I', blob, 4)[0]
    if length > 1024 or length != len(blob) - 8:
        raise ValueError('invalid length')
    return blob[8:].decode('utf-8', errors='strict')

valid = b'DEMO' + pack('<I', 3) + b'cat'
assert parse_record(valid) == 'cat'
for broken in (b'', valid[:-1], valid + b'!',
               b'DEMO' + pack('<I', 2**32-1),
               b'DEMO' + pack('<I', 1) + b'\xff'):
    try:
        parse_record(broken)
    except (ValueError, UnicodeDecodeError):
        continue
    raise AssertionError('malformed record accepted')
~~~
The subtraction check `length != len(blob) - 8` happens only after proving the header exists. That ordering matters in languages with unsigned arithmetic, where subtracting eight from a shorter length can underflow. Python integers do not overflow, but the same file format can be implemented in a fixed-width language later.

## Byte lengths are not character counts
For `γάτα`, UTF-8 byte length and Python character count differ. Store the encoded byte length in the header and test the decoded string separately. A field table should distinguish offset 4 (where length is stored) from offset 8 (where payload begins), and record little-endian byte order. The parser contract above rejects padding; a format that permits multiple records needs a cursor and a different trailing-data policy.

Reference: [Python struct](https://docs.python.org/3/library/struct.html).
