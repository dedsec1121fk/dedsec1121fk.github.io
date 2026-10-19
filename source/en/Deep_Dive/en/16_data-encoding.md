# Text encodings, Unicode and mojibake

## What is happening
UTF-8 represents Unicode as variable-length byte sequences. Mojibake usually means bytes were decoded with the wrong character encoding.

## Practical investigation
Read and write text using an explicit encoding, and distinguish character replacement from normalization. Back up original bytes before transforming a large file.

## Common traps
For JSON in Greek, enable Unicode output without unnecessary ASCII escapes, while keeping the document valid JSON.

## Adaptable demonstration
```text
python -c 'print("Ελληνικά".encode("utf-8"))'
```

## Keep original bytes while testing normalization
~~~python
import unicodedata
text = 'Ελληνικά'
encoded = text.encode('utf-8')
assert encoded.decode('utf-8') == text
assert len(encoded) > len(text)
a = '\u03ac'
b = '\u03b1\u0301'
assert a != b
assert unicodedata.normalize('NFC', a) == unicodedata.normalize('NFC', b)
~~~
The two strings display the same accented Greek letter using different code-point sequences. Normalization is not decoding and cannot reconstruct bytes already replaced with the replacement character. `errors='ignore'` can hide loss by dropping undecodable bytes; it should not be used as a general repair for a damaged document.

If the original file is available, preserve it, inspect a short byte sample and test an explicit candidate encoding on a copy. A correct round trip is useful evidence but does not always identify a unique intended encoding. For JSON, escaped Unicode and literal Unicode can represent the same string value; ensure_ascii=False improves readability without changing the requirement for valid UTF-8 output.
