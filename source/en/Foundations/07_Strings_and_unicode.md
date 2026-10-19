# Strings and Unicode

Files in DedSec include Greek names and UTF-8 documents. Treat text encodings explicitly; do not assume a byte is the same as a character. Use pathlib and encoding="utf-8" for portable files.

## Worked example

```text
from pathlib import Path
p = Path("greek_demo.txt")
p.write_text("Καλημέρα", encoding="utf-8")
print(p.read_text(encoding="utf-8"))
```

## Practice

Explain why using Unicode filenames matters to Greek project paths.

## Corrected result / hint

UTF-8 preserves Greek characters across supported systems.

## Unicode has more than one notion of length
`len("é")` is 1 for the precomposed form; `len("e\u0301")` is 2 code points although both can look identical. UTF-8 stores variable numbers of bytes. Distinguish byte length, code-point count and grapheme clusters; none is automatically a display width.
```python
import unicodedata
a="é"; b="e\u0301"
assert a!=b
assert unicodedata.normalize("NFC",a)==unicodedata.normalize("NFC",b)
assert len(a.encode("utf-8"))==2
```
Normalize for comparison only when your product's requirements allow it. Accent-insensitive search may help readers but must not silently rewrite filenames or tokens. For Greek, case folding changes sigma variants; test `ς` and `σ`.

**Exercise:** build a small search index of Greek and English titles with and without accents; measure false matches instead of declaring all diacritics irrelevant.

## Unicode laboratory: same glyph, different bytes

~~~python
import unicodedata
a, b = "é", "e\u0301"
assert a != b
assert unicodedata.normalize("NFC", a) == unicodedata.normalize("NFC", b)
assert a.encode("utf-8") != b.encode("utf-8")
~~~

The two strings can look identical in a UI but differ as sequences of code points and UTF-8 bytes. Do not assume that `len(text)` counts human-perceived characters. To deliberately reproduce a decoding error, call `b"\xff".decode("utf-8")` and inspect `UnicodeDecodeError`. Replacing or ignoring invalid bytes loses information, so only apply that policy intentionally. As an independent exercise, create two visually identical filenames with distinct normalization forms (if the filesystem permits), inspect their bytes, and define an explicit NFC policy for searching Greek and accented names. Reference: https://docs.python.org/3/library/unicodedata.html
