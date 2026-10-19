# Reverse engineering laboratory: infer and verify an owned binary format

## Goal and boundaries
Build a tiny **fictional** file format from source code you control, then infer its fields by observing actual bytes. The project deliberately needs only Python 3 and no downloads or live targets. This lesson replaces earlier contradictory instructions that mentioned a checksum, UTF-8 records and missing `site/labs/` scripts. **DMR1 version 1 has none of those features.**

## Exact DMR1 v1 specification
| Byte offset | Width | Meaning |
| --- | --- | --- |
| 0–3 | 4 bytes | ASCII magic `DMR1` (hex `44 4d 52 31`) |
| 4–5 | 2 bytes | Unsigned little-endian sample count |
| 6 onward | exactly count bytes | One unsigned 0–255 sample per byte |

For this teaching parser, the count is additionally capped at **64** to exercise bounds validation. Zero samples are valid. No trailing bytes are allowed. No checksum, text encoding, compression, network protocol or version negotiation is present; do not infer them from the name.

## Self-contained executable lab
Create `dmr1_lab.py` with the following contents on Linux, Windows or Termux (Python 3 required), then run `python3 dmr1_lab.py` or `python dmr1_lab.py` where Python uses that command:
~~~python
import struct

MAGIC = b"DMR1"
MAX_SAMPLES = 64

def encode(values):
    if len(values) > MAX_SAMPLES or any(
        type(n) is not int or not 0 <= n <= 255 for n in values
    ):
        raise ValueError("invalid samples")
    return MAGIC + struct.pack("<H", len(values)) + bytes(values)

def decode(raw):
    if len(raw) < 6 or raw[:4] != MAGIC:
        raise ValueError("bad DMR1 header")
    count = struct.unpack_from("<H", raw, 4)[0]
    if count > MAX_SAMPLES or len(raw) != 6 + count:
        raise ValueError("bad DMR1 size")
    return list(raw[6:])

sample = encode([1, 2, 255])
print(sample.hex(), decode(sample))
assert sample.hex() == "444d523103000102ff"
assert decode(encode([])) == []
assert decode(encode([5] * 64)) == [5] * 64

malformed = [
    b"", b"DMR1", b"XXXX" + sample[4:],
    sample[:-1], sample + b"\x00",
    sample[:4] + b"\xff\xff" + sample[6:],
]
for raw in malformed:
    try:
        decode(raw)
    except ValueError:
        pass
    else:
        raise AssertionError("accepted malformed input")
print("malformed cases rejected:", len(malformed))
~~~
**Expected output:**
~~~text
444d523103000102ff [1, 2, 255]
malformed cases rejected: 6
~~~
The leading four bytes identify the format; `03 00` encodes three samples in little-endian order; `01 02 ff` is the payload. The parser checks the full size **before** reading samples. It accepts exactly one interpretation of each record.

## Reverse it without reading the implementation
1. Generate two distinct fixtures (for example `encode([7])` and `encode([7, 8])`). Write down the common prefix, changed offsets and file lengths.
2. Make a hypothesis for each field: offset, size, endianness and constraints. Predict what `encode([])` should produce.
3. Independently verify each prediction against the byte string, then read `decode` and mark hypotheses as supported or disproved.
4. Change one byte at a time in a **copy**. Distinguish bad magic, a truncated header, a count that exceeds payload, and an unexpected trailing byte.
5. Preserve observations as a small table: mutation, predicted outcome, actual exception and alternative interpretation.
6. Compare hashes of the exact fixtures using `hashlib.sha256(raw).hexdigest()`; hashing detects change but reveals no semantics.

## Passing criteria and limits
Pass if you can explain why `444d523103000102ff` is nine bytes, why the count is three, why each of the six malformed cases fails, and why a 64-sample payload is legal while 65 is intentionally rejected. The laboratory is an intentionally simplified example; a production parser would require a separately specified versioning strategy, resource budgets and fuzz testing. Never test unknown binaries by executing them on a personal device.

## Optional AI use
Ask for counterexamples to your byte map, then independently reproduce them. The source, outputs and hex arithmetic—not an AI guess—decide whether a claim is supported.
