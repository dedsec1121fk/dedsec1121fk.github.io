# Recipe: streaming SHA-256 for local file verification

## Intended use and acceptance criteria
This recipe calculates a SHA-256 digest of any local file without reading it into RAM at once. Use it to compare a previously trusted expected digest against a downloaded offline resource. The example exercises one-byte and 64 KiB read sizes and proves that adding one byte changes the result.

## Complete runnable example
Save this as `02_File_hash.py` and execute with Python 3. The fixture is disposable and has no network dependency.

~~~python
import hashlib, tempfile
from pathlib import Path
def sha256_file(path, chunk_size=65536):
    if type(chunk_size) is not int or chunk_size < 1:
        raise ValueError("invalid chunk size")
    digest = hashlib.sha256()
    with open(path, "rb") as stream:
        for chunk in iter(lambda: stream.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()
with tempfile.TemporaryDirectory() as directory:
    item = Path(directory) / "αρχείο.bin"
    item.write_bytes(b"abc")
    expected = hashlib.sha256(b"abc").hexdigest()
    assert sha256_file(item, 1) == expected
    assert sha256_file(item, 65536) == expected
    item.write_bytes(b"abcd")
    assert sha256_file(item) != expected
    item.write_bytes(b"")
    assert sha256_file(item) == hashlib.sha256(b"").hexdigest()
print("PASS streaming file SHA-256")
~~~

## Guarantees and limitations
The digest updates incrementally over raw bytes; hash results are independent of chunk size. Unicode characters in the path do not change the bytes being hashed. An empty file also has a valid deterministic digest. A SHA-256 match demonstrates identity to the trusted reference at comparison time, not publisher authenticity or immunity to concurrent edits. Hashing a file while another process is writing it may produce a digest of an inconsistent snapshot.

## Adaptation lab
Run it against synthetic 10 MiB data using chunk sizes 1, 4096 and 65536 and compare digests. Catch FileNotFoundError separately from PermissionError. Decide whether to inspect file size and timestamp before and after hashing; neither alone is an atomic snapshot. Never replace signature verification with a self-published checksum.

## Troubleshooting and release check
If two files with apparently identical text hash differently, compare encoded bytes, line endings, BOM and Unicode normalization. Do not decode or normalize when the goal is exact file integrity. If the expected digest came from the same untrusted download channel, investigate provenance before trusting it.
