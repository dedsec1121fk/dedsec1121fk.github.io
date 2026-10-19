# Strings in binaries: recover context, not just printable sequences

## Model and limits of inference
Printable byte runs can reveal text labels and diagnostics, but can also be incidental binary data. UTF-8, UTF-16LE and compressed or encrypted data require different approaches. A string hit is evidence of bytes, not proof a particular function, secret or network endpoint is used at runtime.

## Self-contained authorized fixture
~~~python
import re
raw = b"\x00OK\x00" + "Πείραμα".encode("utf-8") + b"\x00BUILD=dev\x00"
ascii_hits = [(m.start(), m.group().decode("ascii"))
              for m in re.finditer(rb"[\x20-\x7e]{4,}", raw)]
assert any(text == "BUILD=dev" for _, text in ascii_hits)
assert not any("Πείραμα" in text for _, text in ascii_hits)
print(ascii_hits)
# Read UTF-8 segments separately; don't decode arbitrary bytes with 'ignore'.
~~~

## Investigation and verification
Record byte offsets for every hit and inspect neighboring bytes to determine whether text is embedded in a record. Explicitly note the minimum length used by tools such as strings. Verify encoding before decoding; errors='ignore' can silently remove evidence. Avoid copying personal identifiers and live credentials into reports.

## Hands-on lab
Create a fixture containing ASCII, UTF-8 and UTF-16LE representations of the same label. Write separate decoders and compare where each method succeeds. Add random binary and show why printable matches need contextual verification.

## Explicit encodings and false positives
~~~python
label = "Δοκιμή"
assert label.encode("utf-8").decode("utf-8") == label
assert label.encode("utf-16le").decode("utf-16le") == label
~~~
Build a fixture with a one-byte length prefix followed by UTF-8 text, and another with UTF-16LE. Search the raw bytes for a known Greek label under both encodings. A byte sequence may look printable by accident; confirm candidate hits using their surrounding field boundaries, length contract and expected encoding. Do not dump private strings from third-party applications: use synthetic samples or files you are authorized to inspect.
## String hits need boundaries and context

Finding an ASCII word in a binary blob does not show that the program uses it as a command, hostname or credential. It may be debug data, compressed coincidence or an unused library message. Store the byte offset and nearby structure before assigning meaning to a strings hit.

Also choose the extraction encoding deliberately. ASCII runs miss UTF-16 text with interleaved zero bytes. A permissive decoder can invent readable fragments from invalid input. The exercise shows two encodings of the same marker and requires an explicit decoding step rather than claiming that a simple ASCII scan is complete.

```python
marker="LAB_NOTE"
blob=b"\x00\xff"+marker.encode("ascii")+b"\x00"+marker.encode("utf-16le")
ascii_offset=blob.index(marker.encode("ascii"))
wide_offset=blob.index(marker.encode("utf-16le"))
assert ascii_offset == 2 and wide_offset > ascii_offset
assert blob[wide_offset:].decode("utf-16le") == marker
print({"ascii_offset":ascii_offset,"utf16_offset":wide_offset})
```

Link a candidate string to a reference or observed runtime event before treating it as reachable behavior. Preserve raw bytes so another analyst can reproduce the decode. Never publish a suspected secret simply to make a report look convincing; redact and document handling decisions.

[Technical reference](https://docs.python.org/3/library/codecs.html)
