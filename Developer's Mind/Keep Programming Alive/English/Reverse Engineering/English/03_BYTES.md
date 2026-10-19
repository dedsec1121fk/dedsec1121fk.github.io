# Binary offsets and endianness: derive fields from test fixtures

## Model and limits of inference
Binary formats are sequences of bytes, not arbitrary characters. A documented field has an offset, width, encoding and semantic range; endianness determines byte order for multi-byte integers. When a parser works on one value but fails at a boundary, check signedness, length and the difference between absolute and relative offsets.

## Self-contained authorized fixture
~~~python
import struct
# Owned toy format: 4-byte magic, unsigned 16-bit little-endian count.
payload = b"DEMO" + struct.pack("<H", 513) + b"OK"
assert payload.hex() == "44454d4f01024f4b"
magic = payload[:4]
count = struct.unpack_from("<H", payload, 4)[0]
assert magic == b"DEMO" and count == 513
assert int.from_bytes(payload[4:6], "big") == 258
try:
    struct.unpack_from("<I", payload, 6)
except struct.error:
    pass
else:
    raise AssertionError("out-of-range field accepted")
~~~

## Investigation and verification
Write an offset table before writing parsing code: 0–3 magic, 4–5 count, 6–7 payload. Validate minimum length before unpacking and reject surprising counts rather than allocating unbounded buffers. Keep raw bytes alongside decoded values in test evidence. Do not use native struct alignment by accident: declare <, > or ! explicitly.

## Hands-on lab
Extend the toy format with a length-prefixed UTF-8 string; reject lengths exceeding the remaining buffer. Test counts 0, 255 and 65535, and compare little-endian and big-endian decoders against the same fixture.

## Derive rather than guess the field width
~~~python
import struct
record = struct.pack("<BH", 2, 513)
assert record.hex() == "020102"
assert struct.unpack("<BH", record) == (2, 513)
~~~
The leading byte can be a version field and the next two a little-endian 16-bit count. Interpret the same bytes as big-endian and write down the changed count. Attempt to decode a two-byte truncated record and expect `struct.error`, not a default zero. An untrusted count must also be compared with remaining payload size *before* slicing or allocating memory. A parser that accepts the toy fixture but trusts any claimed length is not yet safe.
## Round-trip fixtures expose the wrong byte order

A number read with the wrong byte order can still look plausible, especially for small values with many zero bytes. Choose asymmetric fixtures whose bytes are visibly different. Verify the interpretation against both the format's declared order and a round-trip encode/decode test.

A successful round trip proves that your encoder and decoder agree with each other; it does not prove that either agrees with the real format. Keep at least one independent known-answer fixture from the specification or a documented sample. Record offset, width, signedness and byte order together.

```python
raw=bytes.fromhex("01 02 03 04")
little=int.from_bytes(raw,"little")
big=int.from_bytes(raw,"big")
assert little == 0x04030201 and big == 0x01020304
assert little.to_bytes(4,"little") == raw
assert big.to_bytes(4,"big") == raw
assert little != big
print(hex(little),hex(big))
```

Test values at signed boundaries and fields that cross a buffer limit. Avoid inferring the endianness of an entire file from one recognizable value: some formats contain nested structures with their own rules. Mark an interpretation as a hypothesis until independent evidence supports it.

[Technical reference](https://docs.python.org/3/library/stdtypes.html#int.from_bytes)
