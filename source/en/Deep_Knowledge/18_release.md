# Release engineering — deterministic artifacts and reversible promotion

## Scenario and acceptance criteria
Package a small static offline site with two fixture files in a ZIP. Identical inputs, ordering, timestamps and mode metadata must produce identical archive bytes on repeated builds in this runtime. Calculate a SHA-256 checksum, reopen the archive and compare every extracted member with its source. A corrupted artifact must be detected before release promotion.

## Executable lab
Save as `18_release.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
import hashlib, io, zipfile
FILES = {"docs/readme.txt":b"hello\n","site/index.html":b"<h1>Offline</h1>\n"}
def build():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer,"w",compression=zipfile.ZIP_STORED) as z:
        for name, data in sorted(FILES.items()):
            info = zipfile.ZipInfo(name, date_time=(1980,1,1,0,0,0))
            info.compress_type = zipfile.ZIP_STORED
            info.external_attr = 0o100644 << 16
            z.writestr(info,data)
    return buffer.getvalue()
a,b = build(),build()
assert a == b
digest = hashlib.sha256(a).hexdigest()
with zipfile.ZipFile(io.BytesIO(a)) as archive:
    assert sorted(archive.namelist()) == sorted(FILES)
    assert all(archive.read(name)==data for name,data in FILES.items())
assert hashlib.sha256(a+b"x").hexdigest() != digest
print("PASS reproducible fixture ZIP:",digest[:12])
~~~

## Technical interpretation
ZIP members contain filenames, timestamps, permissions, compression settings and content. If metadata or iteration order changes, byte-for-byte reproducibility can fail even when visible content looks the same. The lab fixes timestamps, permissions and order, and uses ZIP_STORED to avoid compressor-version differences. Real build chains must pin tool versions, dependencies and input assets too; identical checksums alone cannot prove software is benign.

## Bounded experiments
Change one fixture byte and record the different SHA-256. Shuffle insertion order and show sorting still yields identical outputs. Remove explicit member timestamps and observe why repeated builds may differ. Store a copy of the previous known-good archive before releasing a new one, then rehearse rollback with a disposable folder.

## Diagnostics
If checksums differ, compare member order, timestamps, permission bits, tool versions and content. Do not ship before verifying that a fresh extraction has every expected entry and that internal links work offline. This in-memory example does not claim to have built or tested the real website.
