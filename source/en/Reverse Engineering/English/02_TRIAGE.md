# Unknown-file triage: classify evidence without executing it

## Model and limits of inference
A filename or extension is a user-supplied hint, not a verified format. Start by preserving the sample, recording size and SHA-256, and inspecting a bounded prefix. Signatures such as PNG or ZIP establish a candidate container, but cannot guarantee that the whole file is valid. Truncated, polyglot and embedded content need a separate parser or container-aware inspection.

## Self-contained authorized fixture
Use only files, modules and network samples that you own or are authorized to inspect. No bypass of protections is required.
~~~python
from pathlib import Path
from tempfile import TemporaryDirectory
import hashlib
with TemporaryDirectory() as tmp:
    p = Path(tmp) / "photo.txt"  # The extension is deliberately misleading.
    p.write_bytes(b"\x89PNG\r\n\x1a\n" + b"not-a-real-png")
    raw = p.read_bytes()
    summary = {
        "size": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "prefix": raw[:16].hex(),
        "looks_like_png": raw.startswith(b"\x89PNG\r\n\x1a\n"),
    }
    assert summary["looks_like_png"]
    print(summary)
    # A real PNG parser would still reject the truncated fake file.
~~~

## Investigation and verification
Work on a copy, not an untrusted original. Identify archive or executable formats from both magic bytes and structural validation, and check whether the claimed size matches reality. Never import, execute or open unknown content with macros enabled just to discover its type. On Linux compare file -b sample with xxd -l 32 sample; document disagreements rather than choosing one tool blindly.

## Hands-on lab
Create a valid ZIP containing two harmless text files, rename it to .jpg and compare the extension, magic header and the zipfile module's namelist. Then truncate the ZIP: explain why a matching beginning is not proof of a valid archive.

## Evidence table for a misleading filename
Create `sample.zip` containing only `hello.txt`, then copy it to `sample.jpg`. Compare three independent claims: extension says JPEG, first four bytes resemble a ZIP local-file header, and Python's `zipfile.is_zipfile` may confirm a structurally valid ZIP. Re-create a *truncated* copy and observe which checks still return a candidate match. A single magic signature is not a safety verdict. Record SHA-256 hashes before editing and never open unidentified executables as part of this lab. For very large files read only the bounded prefix until you have a reason to parse more.
