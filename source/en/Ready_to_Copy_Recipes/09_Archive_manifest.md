# Recipe: bounded ZIP manifest without extracting to disk

## Intended use and acceptance criteria
Before extracting an offline learning pack, inspect its members and produce a stable manifest of name, uncompressed byte count and SHA-256. Reject duplicate member names, absolute or parent paths and archive content above a small predefined total. The fixture is created entirely in memory and no untrusted file is written onto disk.

## Complete runnable example
Save this as `09_Archive_manifest.py` and execute with Python 3. The fixture is disposable and has no network dependency.

~~~python
import hashlib, io, zipfile
def manifest(zip_bytes, total_limit=2048):
    entries, seen, total = [], set(), 0
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        for entry in archive.infolist():
            name = entry.filename
            if (name in seen or name.startswith("/") or "\\" in name or
                    any(x in ("", ".", "..") for x in name.split("/"))):
                raise ValueError("unsafe or duplicate member")
            seen.add(name)
            total += entry.file_size
            if total > total_limit or entry.file_size > total_limit:
                raise ValueError("archive content over limit")
            data = archive.read(entry)
            entries.append((name,len(data),hashlib.sha256(data).hexdigest()))
    return sorted(entries)
buffer = io.BytesIO()
with zipfile.ZipFile(buffer,"w",zipfile.ZIP_STORED) as out:
    out.writestr("docs/a.txt",b"alpha")
    out.writestr("assets/icon.txt",b"icon")
items = manifest(buffer.getvalue())
assert [x[0] for x in items] == ["assets/icon.txt","docs/a.txt"]
assert items[1][1] == 5
try: manifest(buffer.getvalue(),3)
except ValueError: pass
else: raise AssertionError("archive limit ignored")
print("PASS bounded ZIP manifest")
~~~

## Guarantees and limitations
ZipInfo.file_size provides declared uncompressed size. The example also checks actual bytes read and hashes each file, but it deliberately remains limited to tiny archives. A malicious ZIP may include symlinks encoded in metadata, unsupported compression, deceptive encoding or extreme compression ratios; safe extraction needs additional checks and strict streaming decompression caps. Member names should be validated before creating any output file.

## Adaptation lab
Add a third valid member and check deterministic manifest ordering. Insert a `../outside.txt` member and prove the tool rejects it. Test repeated member names, a directory entry, an archive above the total limit and an invalid ZIP. Distinguish inspecting ZIP metadata from proving extracted files are safe to open or execute.

## Troubleshooting and release check
If a member is rejected, display its escaped name, not a normalized guess at its intended path. A ZIP that looks small on disk may expand dramatically; cap total uncompressed bytes and member counts. Do not call extractall on untrusted input without a separate extraction security review.
