# Release engineering — a reproducible bilingual ZIP fixture

## Acceptance contract and scope
A release of the bilingual offline library needs an immutable source revision, an inventory of files, repeatable build inputs and metadata, integrity evidence, and a rollback plan. Byte-identical packages made in the documented toolchain should have the same SHA-256. Hashes detect altered bytes but do not independently authenticate the publisher. Passing ZIP CRC checks also does not establish that every lesson is accurate or each code example runs on Windows, Linux and Android.

## Executable Python 3 build and check
Save as release_lab.py and run python3 release_lab.py. The program creates an in-memory archive with ordered entries, fixed timestamps and POSIX mode metadata. ZIP_STORED avoids compression differences from zlib versions in this small fixture.

~~~python
import hashlib
from io import BytesIO
from zipfile import ZIP_STORED, ZipFile, ZipInfo

def build(files):
    result = BytesIO()
    with ZipFile(result, 'w') as z:
        for name in sorted(files):
            if name.startswith('/') or '..' in name.split('/'):
                raise ValueError('unsafe archive path')
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_STORED
            info.external_attr = 0o100644 << 16
            z.writestr(info, files[name])
    return result.getvalue()

files = {'English/lesson.md': b'# English\n',
         'Greek/lesson.md': '# Ελληνικά\n'.encode()}
first, second = build(files), build(dict(reversed(list(files.items()))))
assert first == second
expected = hashlib.sha256(first).hexdigest()
assert hashlib.sha256(second).hexdigest() == expected
with ZipFile(BytesIO(first)) as archive:
    assert archive.namelist() == sorted(files)
    assert archive.testzip() is None
    assert all(archive.read(name) == files[name] for name in files)
changed = build({**files, 'English/lesson.md': b'# Changed\n'})
assert hashlib.sha256(changed).hexdigest() != expected
print('PASS release: stable fixture, CRC, byte changes and SHA-256')
~~~

## Real release gates
Build from a concrete, immutable commit SHA and produce fresh indexes **after** editing Markdown so the website and archive refer to the same texts. Compare both language inventories by stable lesson identity rather than assuming translated path names match. Stage artifacts outside the public directory and hash the final published bytes. Verify SHA-256 on a downloaded copy using a trusted checksum; ZIP testzip provides CRC-based corruption detection but not authenticity. Record operating system, interpreter, compression mode, dependency versions and flags needed to reproduce the binary. A correct release also needs negative and integration tests, browser checks, offline open tests, and a documented fallback to the previous working artifact.

## Exercises and reproducibility diagnostics
1. Change exactly one content byte and confirm the SHA-256 changes. Reverse the input dictionary insertion order and confirm output does not change.
2. Export synthetic English and Greek pairs with different human-readable names. Compare stable logical IDs and report missing partners.
3. Simulate a crash before publishing. Explain how a temporary file followed by verification and atomic replacement, where supported, prevents incomplete replacement.
4. Build with a second Python runtime or operating system and compare output digests. Report unknown or untested environments instead of extrapolating.

**Evidence:** PASS, hash of the generated fixture, input file inventory, tool versions and an honest validation matrix distinguishing tested from untested requirements.
## Further engineering detail

Pinning an external dependency means reviewing a pair: the release URL and the digest of its exact bytes. Update and roll back that pair together. A hash recomputed from whatever a remote server returns during every build verifies transport consistency with itself, not approval of a specific reviewed release.

[Subresource integrity and release pinning](#read:fieldnotes-en-46)
