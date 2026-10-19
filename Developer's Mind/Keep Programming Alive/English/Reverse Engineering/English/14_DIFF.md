# Comparing revisions: classify behavioral, structural and metadata changes

## Model and limits of inference
Two builds with different hashes need not behave differently; timestamps, compression and reordered metadata can change bytes. Conversely, a tiny source diff can alter a critical branch. Compare the right level: hash for identity, structured diff for changed fields, and regression fixtures for observed behavior.

## Self-contained authorized fixture
~~~python
from hashlib import sha256
import difflib
a = "limit=10\nmode=fast\n"
b = "limit=11\nmode=fast\n"
assert sha256(a.encode()).digest() != sha256(b.encode()).digest()
diff = list(difflib.unified_diff(
    a.splitlines(True), b.splitlines(True), fromfile="old", tofile="new"))
assert any("-limit=10" in line for line in diff)
assert any("+limit=11" in line for line in diff)
print("".join(diff))
~~~

## Investigation and verification
Before a diff, normalize only fields proven irrelevant to the investigation, never discard unknown fields. Track changed file count, line changes and added/removed dependencies. Pair every suspected semantic change with an input that distinguishes old from new behavior. Preserve both originals and record hashes so a later analyst can reproduce the comparison.

## Hands-on lab
Create two ZIP builds with identical extracted text but different archive timestamps; show hash inequality and matching extracted content. Then change one numeric threshold and write a regression test whose output changes only after crossing the boundary.

## Separate reproducibility from semantic equivalence
Build two ZIP files containing the same harmless text but with different file timestamps. Their container hashes may differ even when extracted file hashes match. Compare three layers: container bytes, normalized entry metadata, and extracted content. Then change one threshold in a toy calculator and write a boundary test that distinguishes versions. Do not sort arbitrary binary data or discard every metadata field: permissions, order and signatures can be meaningful. A normalized comparison is only valid after explicitly documenting which differences are intentionally ignored.
