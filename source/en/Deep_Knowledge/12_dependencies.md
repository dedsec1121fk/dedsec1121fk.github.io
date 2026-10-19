# Dependency integrity — compare a pinned manifest and artifact

## Scenario and acceptance criteria
A local tool uses a fixed dependency bundle. Its expected manifest must identify the exact package, version and SHA-256 digest. Refuse unexpected manifest fields, invalid versions and altered bytes. This exercise checks *integrity against a trusted expected digest*; it does not assert that a checksum downloaded from the same compromised source proves authenticity.

## Executable lab
Save as `12_dependencies.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
import hashlib, json, re
payload = b"offline reference fixture"
trusted_digest = hashlib.sha256(payload).hexdigest()
manifest = json.dumps({"name":"fixture","version":"2.4.1","sha256":trusted_digest})
def verify(manifest_text, blob):
    meta = json.loads(manifest_text)
    if set(meta) != {"name","version","sha256"}:
        raise ValueError("unexpected manifest fields")
    if meta["name"] != "fixture" or not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+",meta["version"]):
        raise ValueError("untrusted name or unpinned version")
    if not re.fullmatch(r"[0-9a-f]{64}", meta["sha256"]):
        raise ValueError("invalid checksum")
    if hashlib.sha256(blob).hexdigest() != meta["sha256"]:
        raise ValueError("integrity failure")
    return True
assert verify(manifest, payload)
for bad in (payload+b"x", payload[:-1]):
    try: verify(manifest,bad)
    except ValueError: pass
    else: raise AssertionError("tamper undetected")
print("PASS pinned offline integrity fixture")
~~~

## Technical interpretation
Pinning a version makes drift visible, but security also depends on where the package and expected digest came from. Resolve the dependency tree, preserve the lockfile and evaluate transitive packages. An attacker who changes both the payload and checksum may pass a naïve local comparison. For real distributions, obtain manifests over trusted channels and verify publisher signatures or immutable trusted references where available.

## Bounded experiments
Change one byte of payload and confirm rejection. Add a fake extra manifest field, version `latest`, uppercase checksum and a second package name. Explain why each fails. Compare a frozen lockfile to unconstrained version ranges, and document a real vulnerability-advisory review process. The fixture remains offline and never installs a package.

## Diagnostics
If a checksum differs, stop and investigate; never disable the check to force a successful install. Compare the downloaded artifact, encoding, expected digest source and package version. Log a digest identifier, not secret access tokens. Record which transitive dependencies were actually inspected.
