# A successful ZIP operation is not a verified release

## Define the source of truth
A release should record the exact source revision, license, dependency versions, target OS/architecture and command used for packaging. Collect files from an explicit allowlist rather than packaging every development cache and local credential. Normalize entry paths and preserve a clear top-level directory structure that works for Windows, Linux and Android ZIP viewers.

~~~sh
python -m compileall -q scripts
sha256sum release.zip
unzip -t release.zip
unzip -Z1 release.zip | head -30
~~~

## Threat model the archive itself
A ZIP can contain `../` entries, absolute paths, symlinks, duplicate filenames or huge compressed members. Verify the members before extracting untrusted archives. Never unzip unknown content directly into your home folder or a server document root. A SHA-256 digest detects changed bytes when compared to a trusted published checksum, but it does not establish who produced the release by itself.

## Make the build repeatable
Timestamps, file ordering and platform-dependent separators can change archive hashes between runs. Sort entries and use stable metadata when byte-for-byte reproducibility is required. Compare the final archive's manifest against actual filenames and record the exact Python/zip tooling version. Keeping only final files avoids publishing accidentally generated test data and authentication tokens.

## Acceptance exercise
Package two small sample files and compute their file hashes. Then make a fresh extraction into a disposable directory, validate expected content and try a second build from the same sources. State whether hashes match and why they might differ. Do not claim reproduction without recording both observed digests.
## Normalize archive metadata before comparing release hashes

Two ZIP files containing the same document text can have different hashes because entry order, timestamps, permissions or compression settings differ. Reproducibility requires controlling the packaging process as well as the source contents. Sort paths, choose a deliberate timestamp and document whether compression output is expected to remain identical across tool versions.

Use a temporary staging tree and never normalize timestamps by modifying the user's working files. The fixture creates two deterministic uncompressed archives in memory. It demonstrates byte reproducibility for this controlled recipe, not for every ZIP compressor.

```python
import io, zipfile, hashlib
def release():
    output=io.BytesIO()
    with zipfile.ZipFile(output,"w",compression=zipfile.ZIP_STORED) as z:
        for name,data in sorted({"b.txt":b"two", "a.txt":b"one"}.items()):
            entry=zipfile.ZipInfo(name,date_time=(2020,1,1,0,0,0))
            entry.create_system=3
            entry.external_attr=0o100644 << 16
            z.writestr(entry,data)
    return output.getvalue()
a,b=release(),release()
assert a == b
print(hashlib.sha256(a).hexdigest())
```

Change one input byte and verify that the release hash changes. Record toolchain and packaging settings next to the manifest. Reproducible packaging does not establish that an archive is safe to extract; path traversal and decompression limits remain separate checks.

[Technical reference](https://docs.python.org/3/library/zipfile.html)
