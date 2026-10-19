# Binary formats — bounded parsing, versions and integrity checks

## Define a wire format before writing bytes
Design a small record containing UTF-8 text. Its header is eleven bytes: magic DSK1 (four bytes), version (one unsigned byte), payload length (two-byte unsigned big-endian integer) and CRC32 (four-byte unsigned big-endian integer). The payload follows immediately. This explicit layout is portable across little-endian and big-endian machines. The application limits payloads to 64 bytes and rejects unknown versions, extra trailers, truncated messages and corrupt checksums.

## Run the parser in isolation
Save as binary_lab.py and run python3 binary_lab.py. There are no external packages, network calls or writes. Every failure is deliberately triggered on synthetic bytes.

~~~python
import struct
import zlib

MAGIC, LIMIT = b"DSK1", 64

def encode(content):
    raw = content.encode("utf-8")
    if len(raw) > LIMIT:
        raise ValueError("payload too large")
    return struct.pack(">4sBHI", MAGIC, 1, len(raw), zlib.crc32(raw)) + raw

def decode(frame):
    if len(frame) < 11:
        raise ValueError("short header")
    magic, version, size, checksum = struct.unpack(">4sBHI", frame[:11])
    if magic != MAGIC or version != 1 or size > LIMIT or len(frame) != 11 + size:
        raise ValueError("invalid header or length")
    raw = frame[11:]
    if zlib.crc32(raw) != checksum:
        raise ValueError("corrupted bytes")
    return raw.decode("utf-8")

good = encode("γειά")
assert decode(good) == "γειά"
for bad in (good[:10], good[:-1], good[:5] + b"\xff" + good[6:],
            good[:11] + b"x" + good[12:], good + b"x"):
    try:
        decode(bad)
    except (ValueError, UnicodeError):
        pass
    else:
        raise AssertionError("corruption accepted")
print("PASS: length/version/checksum and UTF-8 checks")
~~~

## Why validation precedes allocation and decode
The header length must be checked before struct.unpack, and the claimed payload size must be bounded before consuming it. The real received length must match the header exactly; otherwise a valid prefix could hide unwanted trailing data. CRC32 detects accidental corruption but is not authentication or a cryptographic signature: an attacker can recompute it. UTF-8 decoding can fail even when the checksum is valid if the payload was deliberately constructed with invalid bytes. Do not use pickle with untrusted input because it may invoke arbitrary code during deserialization.

## Bounded investigative tasks
1. Flip one version byte and one character byte, then observe which check fails first. Restore the original bytes after each test.
2. Replace the text with Greek and an emoji. Compare len(text) with len(text.encode('utf-8')); the length field must count bytes.
3. Claim an impossible size of 65535 in the header. The parser must reject before allocating a matching buffer.
4. Define version 2 as a separate format; do not interpret old payloads under an unannounced new layout. Explain how you would test backward compatibility.

**Evidence:** PASS, a byte-layout diagram, five malformed frames, and a written distinction between integrity and authenticity.
