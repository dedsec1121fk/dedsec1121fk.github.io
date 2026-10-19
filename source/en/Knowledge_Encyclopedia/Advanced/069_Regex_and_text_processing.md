# Regular expressions — literal user queries and Unicode boundaries

## Intent and threat model
An offline search box should treat a user-entered expression as literal text by default. The user may enter a+b, [note] or punctuation that has meaning in regular-expression syntax. Passing the string directly to re.compile changes the intended search. Use re.escape to build a literal pattern. If the application intentionally offers regular expressions, validate and bound input size, communicate that they are a different search mode, and avoid feeding adversarial unbounded strings to nested ambiguous quantifiers.

## Executable Python 3 example
Save as regex_lab.py and run python3 regex_lab.py. It checks literal escaping, fullmatch, greedy/lazy quantifiers and the difference between a Unicode word class and ASCII letters.

~~~python
import re
needle = "a+b"
assert re.search(re.escape(needle), "code a+b end").group() == "a+b"
assert re.findall(r"<.*>", "<a><b>") == ["<a><b>"]
assert re.findall(r"<.*?>", "<a><b>") == ["<a>","<b>"]
assert re.fullmatch(r"[0-9]{4}", "2026")
assert not re.fullmatch(r"[0-9]{4}", "x2026")
assert re.fullmatch(r"\w+", "Αθήνα")
assert not re.fullmatch(r"[A-Za-z]+", "Αθήνα")
print("PASS: literal escaping, greedy vs lazy, Unicode")
~~~

## Why the distinctions matter
re.search finds a substring while re.fullmatch must consume the entire input. The expression <.*> is greedy and consumes both bracketed fields as one match, whereas <.*?> stops at the closest compatible closing bracket. Neither expression is a real HTML parser; tags can be nested, malformed or contain quoted angle brackets. Python's Unicode-aware word character class includes Greek letters, while [A-Za-z] covers only basic Latin letters. For security-sensitive IDs, a precise allowed-character contract is safer than an ambiguous definition of a word.

## Bounded exercises and diagnostics
1. Search literally for [a+b] and compare escaped versus unescaped behavior; capture the regex compilation exception for an unmatched bracket.
2. Try empty text, a 1,024-character query and several accented Greek words. Decide on a documented maximum size and expected result for the empty query.
3. Construct a tiny synthetic string with nested ambiguous quantifiers such as (a+)+$ and a mismatching suffix. Do not benchmark catastrophic backtracking on arbitrary large inputs; prefer a safe parser or an engine with time limits for untrusted patterns.
4. Compare greedy and lazy matches when quotes or nesting are introduced. State why a structured parser is necessary.

**Evidence:** PASS, seven concrete assertions, escaped literal examples, and an explicit separation between literal search and regex mode.
