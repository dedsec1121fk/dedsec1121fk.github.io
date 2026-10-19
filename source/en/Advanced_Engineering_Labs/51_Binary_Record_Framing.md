# Binary record framing and truncated input

## Mechanism and contract

A byte stream has no inherent application records. A length-prefixed format can identify each payload, but the parser must validate the prefix before allocating or reading the body. Specify prefix width, byte order, maximum payload length and behavior at end of input. A four-byte unsigned length can describe a body much larger than a small device can safely retain.

Keep “need more bytes” distinct from “invalid frame” and “clean end of stream.” A partial header at final input is truncated data, not an empty successful record. A partial payload must not advance the public record cursor as if processing finished. The fixture uses a deliberately tiny maximum so oversize rejection is observable without allocating large memory.

## Worked local example

```python
import struct

def parse_one(raw, limit=16):
    if len(raw) < 4:
        raise ValueError("truncated header")
    size = struct.unpack("!I", raw[:4])[0]
    if size > limit:
        raise ValueError("oversized frame")
    if len(raw) != 4 + size:
        raise ValueError("truncated body or trailing bytes")
    return raw[4:]
assert parse_one(struct.pack("!I", 3) + b"abc") == b"abc"
for bad in (b"\x00", struct.pack("!I", 17), struct.pack("!I", 3)+b"ab"):
    try:
        parse_one(bad)
    except ValueError:
        continue
    raise AssertionError("bad frame accepted")
print("frame limits enforced")
```

## Failure checks and limits

This function parses exactly one complete frame. A streaming protocol needs a buffer and explicit incremental states instead of treating every short read as final failure. Test zero-length payloads, multiple frames, all split points and invalid sizes. Apply decompression limits separately when a valid small frame contains compressed content that could expand dramatically.

## Primary reference

[Official documentation](https://docs.python.org/3/library/struct.html)
