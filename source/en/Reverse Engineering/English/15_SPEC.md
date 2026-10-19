# Derive a small format specification from controlled observations

## Model and limits of inference
Reverse engineering is most valuable when observations become an explicit, falsifiable specification. A useful spec names field offsets, lengths, encodings, constraints, error behavior and examples. Mark unknown fields as unknown rather than assigning invented meaning. Make every claim testable using at least one valid and one invalid fixture.

## Self-contained authorized fixture
~~~python
from dataclasses import dataclass
import struct
@dataclass(frozen=True)
class Header:
    version: int
    count: int

def parse(data: bytes) -> Header:
    if len(data) != 7 or data[:4] != b"SPEC":
        raise ValueError("bad envelope")
    version, count = struct.unpack_from("<BH", data, 4)
    if version != 1 or count > 100:
        raise ValueError("unsupported header")
    return Header(version, count)

assert parse(b"SPEC" + struct.pack("<BH", 1, 4)) == Header(1, 4)
for invalid in (b"SP", b"SPEC" + struct.pack("<BH", 2, 4)):
    try: parse(invalid)
    except ValueError: pass
    else: raise AssertionError("bad header accepted")
~~~

## Investigation and verification
Write a field table: bytes 0–3 magic SPEC, 4 version u8, 5–6 count u16 little-endian. Define failure cases: wrong magic, incorrect total length, unsupported version and count over 100. Specify whether readers may ignore trailing data. Implement the parser independently from the fixture generator to avoid circular confirmation.

## Hands-on lab
Add version 2 with one new flag byte. Design backward-compatibility tests and state which reader versions reject or accept it. Include a compact hex fixture and a field-by-field annotation in your documentation.

## Convert observations into falsifiable rules
Draft a field table with offset, width, encoding, constraint and failure action for each version of your toy format. Include two good fixtures and three bad ones: truncated header, unsupported version and payload length larger than remaining bytes. A real specification must say whether unknown flags are ignored, preserved, or rejected; do not quietly invent behavior from one sample. Use round-trip tests `decode(encode(value)) == value` for supported inputs and keep a known-bad fixture for each rejection rule. Mark every inferred field as provisional until independent examples confirm it.
