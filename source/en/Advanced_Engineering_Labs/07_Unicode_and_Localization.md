# Unicode, encodings and multilingual search

## Unicode, encodings and language-sensitive search

### Text is not the same as bytes or displayed characters
UTF-8 encodes Unicode scalar values into bytes, and a visible grapheme cluster may contain several code points. Python len(text) counts code points, not bytes and not necessarily the number of user-perceived characters. A rendered emoji with a modifier or a letter plus combining accent is a useful counterexample.

~~~python
import unicodedata as ud

composed = "é"
decomposed = "e\u0301"
assert composed != decomposed
assert ud.normalize("NFC", composed) == ud.normalize("NFC", decomposed)
assert len(composed.encode("utf-8")) != len(decomposed.encode("utf-8"))
~~~

Normalization can help equality checks, but it does not magically make string comparison locale-aware. Python casefold is designed for caseless matching and can change string length. For example, the German character ß casefolds to ss.

### A search index may intentionally ignore accents
For accent-insensitive search, a controlled pipeline can apply casefold, decompose to NFD and remove combining mark categories. But blindly stripping marks from every language can destroy meaningful distinctions. Keep original text for display, operate on a separate index key, and document which locales the normalization strategy supports.

### Filename and archive boundaries
Filesystem names may use different normalization conventions depending on OS. Never assume that text extracted from ZIP is safe because it is valid UTF-8: path traversal checks, absolute paths and collisions after normalization must be addressed separately. A normalization collision means two distinct source entries can map to one target filename.

### Localization fallbacks
Create an English/Greek resource map and deliberately remove one Greek key. The UI should use a documented fallback rather than a blank label or raw undefined. Validate placeholders before interpolation: a translated string that omits or renames a placeholder can break formatting even when both translations exist.

### Acceptance tests
Compare composed/decomposed strings, Greek text with tonos, German ß and one multi-code-point emoji. Test expected matching behavior separately from display behavior. Run on Python version recorded in your results and check that your search index cannot silently overwrite an unrelated path after normalization.

## Unicode and text encoding

### Problem and mental model
Two strings can look identical yet contain different code points. In Unicode, an accented character may be precomposed or represented with a combining mark. NFC normalization gives a consistent comparison representation without implying that all visually confusable text is equivalent.

### Reproducible illustration
~~~python
import unicodedata
left = 'é'
right = 'e\u0301'
assert left != right
assert unicodedata.normalize('NFC', left) == unicodedata.normalize('NFC', right)
assert len(left.encode('utf-8')) != len(right.encode('utf-8'))
~~~

### Independent validation
Try accented Greek names and final sigma casefolding. Measure codepoint count and UTF-8 byte count independently. Never normalize arbitrary binary files; decide whether search needs NFC, NFKC, casefold or accent-sensitive matches, and preserve original display text.

**Authoritative documentation:** https://docs.python.org/3/library/unicodedata.html
