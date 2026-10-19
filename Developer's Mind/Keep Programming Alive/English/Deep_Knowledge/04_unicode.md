# Unicode text — searchable keys and preserved originals

## Scenario
A bilingual offline knowledge library stores original Greek and English titles for display and creates a separate search key for case-insensitive matching. Visually identical words can contain distinct code-point sequences. A normalized search key may collide across distinct original titles, so it is unsuitable as an irreversible replacement for stored text or as a unique database identifier.

## Executable Python 3 experiment
Save as unicode_lab.py and run python3 unicode_lab.py. The tests cover precomposed and decomposed accents, Greek sigma variants, Turkish dotted I, an emoji joined by U+200D and an invalid UTF-8 byte boundary.

~~~python
import unicodedata as ud

def search_key(text):
    if not isinstance(text, str):
        raise TypeError('expected Unicode text')
    return ud.normalize('NFC', ud.normalize('NFC', text).casefold())

assert search_key('café') == search_key('cafe\u0301')
assert search_key('Σ') == search_key('ς')
assert search_key('İ') != search_key('i')
assert len('👩\u200d💻') == 3  # three code points, one displayed emoji
raw = 'έ'.encode('utf-8')
try:
    raw[:1].decode('utf-8')
except UnicodeDecodeError:
    pass
else:
    raise AssertionError('partial UTF-8 decoded unexpectedly')
assert ud.normalize('NFD', 'έ') != 'έ'
print('PASS unicode: NFC, casefold, UTF-8 boundary')
~~~

## Interpreting the experiment
The visible letter é may be a single precomposed code point, or Latin e plus a combining accent. NFC maps canonically equivalent sequences to a common form; NFD decomposes many accented letters. The casefold operation is useful for comparison but is not reversible: both capital Greek sigma and final sigma can fold to the same value. Turkish dotted capital İ is not equivalent to plain Latin i under ordinary casefolding. Python len measures Unicode code points, not human-perceived grapheme clusters. The woman-technologist emoji consists of three code points but usually appears as one grapheme. UTF-8 encoding uses variable-length byte sequences, so arbitrary byte cuts can create invalid text.

## Bounded exercises
1. Print repr and Unicode code-point names for café and its decomposed equivalent. Preserve both original values and compare their normalized keys.
2. Insert titles Σ and ς into a test search index. A collision must return both original titles rather than silently overwrite one.
3. Compare a Greek accented title and a mixed-script lookalike. Normalization is not transliteration or a defense against confusable identifiers.
4. Cut a Greek UTF-8 sequence after the first byte and capture UnicodeDecodeError. Explain why code-point slicing is still not the same as grapheme-aware display truncation.

**Evidence:** PASS, code-point listings, one deliberate search-key collision and a demonstrated UTF-8 decode error.
## Further engineering detail

Encoding boundaries matter before normalization begins. A byte chunk can end halfway through a UTF-8 character, so decode incrementally and flush the decoder at the real end of input. Only then apply text normalization and record parsing; replacement characters introduced too early can alter identifiers and invalidate later comparisons.

[Incremental UTF-8 decoding across chunk boundaries](#read:fieldnotes-en-41)
