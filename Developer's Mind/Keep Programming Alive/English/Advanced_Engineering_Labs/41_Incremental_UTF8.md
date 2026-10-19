# Incremental UTF-8 decoding across chunk boundaries

## Mechanism and contract

A network read returns bytes according to buffering and transport timing, not Unicode character boundaries. A multibyte UTF-8 character can straddle two chunks. Decoding each chunk independently may reject valid input or insert replacement characters. An incremental decoder retains incomplete bytes until later data completes the character.

Keep three limits separate: compressed bytes received, decompressed bytes produced and decoded characters retained. Streaming is not memory-safe if every decoded fragment is appended forever. A text parser also needs record boundaries after decoding; one read is not necessarily one line or JSON document. The exercise deliberately splits Greek text inside its first character so a boundary error is deterministic.

## Worked local example

```python
import codecs
raw = "γνώση".encode("utf-8")
decoder = codecs.getincrementaldecoder("utf-8")(errors="strict")
parts = [decoder.decode(raw[:1]), decoder.decode(raw[1:4]),
         decoder.decode(raw[4:], final=True)]
assert "".join(parts) == "γνώση"
try:
    codecs.getincrementaldecoder("utf-8")().decode(b"\xce", final=True)
except UnicodeDecodeError:
    pass
else:
    raise AssertionError("incomplete character accepted")
print("chunk boundaries handled")
```

## Failure checks and limits

Test every possible split position in a short multilingual fixture. A final=True call is essential to expose a trailing incomplete character. Choose strict rejection for protocol data when silent replacement would change identifiers. If a viewer uses replacement for display, keep that display policy separate from validated storage and authorization decisions.

## Primary reference

[Official documentation](https://docs.python.org/3/library/codecs.html#incrementaldecoder-objects)
