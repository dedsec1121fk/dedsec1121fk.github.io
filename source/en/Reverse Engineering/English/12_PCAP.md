# PCAP headers: validate capture metadata before interpreting packets

## Model and limits of inference
A packet capture represents observed network traffic, not necessarily full application messages. An initial PCAP header specifies byte order, timestamp precision, snaplen and link-layer type. Truncated or malformed record lengths can mislead analysis. Only capture networks and devices you control or are authorized to test; redact payloads and identifying metadata.

## Self-contained authorized fixture
~~~python
import struct
# Synthetic classic PCAP, little-endian, Ethernet link type (1), no packets.
header = struct.pack("<IHHIIII",
    0xa1b2c3d4, 2, 4, 0, 0, 65535, 1)
assert len(header) == 24
magic = header[:4].hex()
major, minor = struct.unpack_from("<HH", header, 4)
snaplen = struct.unpack_from("<I", header, 16)[0]
linktype = struct.unpack_from("<I", header, 20)[0]
assert (major, minor, snaplen, linktype) == (2, 4, 65535, 1)
print("magic:", magic, "linktype:", linktype)
~~~

## Investigation and verification
First distinguish classic PCAP from PCAPNG; they use different structures. Verify magic and byte order, then inspect record boundaries and captured_length <= original_length. Decode Ethernet/IP/TCP only if the linktype and enough bytes support that interpretation. Encrypted traffic may reveal endpoints and timings without exposing decrypted content; do not infer plaintext messages.

## Hands-on lab
Extend the header fixture with one synthetic packet record of four bytes, parse timestamps and captured/original lengths, and assert offsets. Corrupt the declared captured length to exceed the file and reject it before decoding any payload.

## Validate the record boundary before decoding payloads
For classic PCAP, each packet record begins with four 32-bit fields after the 24-byte global header: timestamp seconds, timestamp fraction, captured length and original length, interpreted using the file's byte order. The captured length must not exceed available bytes, and it should normally be no greater than the advertised original length or snaplen for a well-formed capture. Make a synthetic record with four harmless bytes and a declared captured length of four; then declare eight without adding bytes and require a clean validation error. Never assume that a packet capture contains entire TCP application messages or that timestamps are necessarily nanoseconds.
