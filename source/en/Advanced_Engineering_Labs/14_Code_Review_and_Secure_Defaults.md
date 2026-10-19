# Secure review — ZIP preflight and untrusted paths

## Scenario and threat boundary
A local knowledge tool accepts ZIP archives from somebody else. Archive member names are untrusted metadata: an attacker can attempt directory traversal, absolute paths, Windows separators, duplicate destinations, Unix symlinks or unexpectedly large uncompressed entries. Reject suspicious members before attempting extraction. The following validator intentionally **does not extract** anything: it is a bounded, introductory preflight rather than a complete safe ZIP import implementation.

## Executable Python 3 exercise
Save as zip_review.py and run python3 zip_review.py. Tests create synthetic archives in memory, including a traversal name and a ZIP member with a Unix symlink flag.

~~~python
from io import BytesIO
from pathlib import PurePosixPath
from stat import S_IFMT, S_IFLNK
from zipfile import ZipFile, ZipInfo

def verify_manifest(blob, max_files=20, max_bytes=100_000):
    total, names = 0, set()
    with ZipFile(BytesIO(blob)) as archive:
        for member in archive.infolist():
            name = member.filename
            parts = name.rstrip('/').split('/')
            target = PurePosixPath(name)
            if (not name or target.is_absolute() or '\\' in name
                    or any(part in ('', '.', '..') for part in parts)
                    or any(ord(ch) < 32 for ch in name)):
                raise ValueError('invalid ZIP member path')
            if name in names:
                raise ValueError('duplicate ZIP member')
            names.add(name)
            mode = S_IFMT(member.external_attr >> 16)
            if mode == S_IFLNK:
                raise ValueError('symlink in archive')
            if member.is_dir():
                continue
            total += member.file_size
            if len(names) > max_files or total > max_bytes:
                raise ValueError('archive limit exceeded')
            if member.file_size > 0 and (member.compress_size == 0
                   or member.file_size > 100 * member.compress_size):
                raise ValueError('suspicious compression ratio')
    return len(names)

def fixture(name):
    b = BytesIO()
    with ZipFile(b, 'w') as z:
        z.writestr(name, 'hello')
    return b.getvalue()

assert verify_manifest(fixture('docs/lesson.txt')) == 1
for wrong in ('../private.txt', 'docs/../private.txt', '/absolute', 'back\\slash'):
    try: verify_manifest(fixture(wrong))
    except ValueError: pass
    else: raise AssertionError(wrong)
symlink = ZipInfo('linked')
symlink.create_system = 3
symlink.external_attr = (0o120777 << 16)
b = BytesIO()
with ZipFile(b, 'w') as z:
    z.writestr(symlink, 'outside')
try: verify_manifest(b.getvalue())
except ValueError: pass
else: raise AssertionError('symlink accepted')
print('PASS ZIP preflight: path traversal, absolute, backslash, symlink')
~~~

## Security analysis and limitations
The manifest checks reject empty, absolute, dot/dotdot and backslash paths, control characters, exact duplicate names, Unix symlinks and suspicious declared sizes or compression ratios. That is not sufficient for safe production extraction. ZIP sizes can be adversarial; a full importer must bound the **actual decompressed bytes** while streaming, resource usage, execution time and destination disk space. A secure extractor must check the canonical destination remains inside a dedicated staging directory, reject special files, and handle case-insensitive collisions such as A.txt versus a.txt or normalized Unicode names. The code does not cover drive-prefix paths such as C:foo, nor validate every filesystem-specific filename rule. Never extract directly over application or personal files without explicit user authorization and a rollback plan.

## Bounded review and negative testing
1. Add a member with a drive prefix or trailing space, a repeated exact name, and two canonically equivalent Unicode names. Define a rejection policy and add failing tests.
2. Compare member.file_size with the amount actually read while decompressing under an enforced byte budget; explain why metadata is not a trusted limit.
3. Model an attacker who supplies an archive containing a symlink and a following file path through that symlink. Show why resolving paths and refusing symlinks matters.
4. Produce a review checklist covering assets, inputs, privileges, storage writes, denied operations, error reporting and cleanup of a partially created staging directory.

**Evidence:** PASS, at least five rejected archives and an explicit note that full extraction security and filesystem containment were not established by this demonstration.
## Further engineering detail

Browser policy rollout deserves functional tests alongside header inspection. A restrictive policy can block theme controls or lesson navigation while leaving the first screenshot apparently correct. Collect report-only evidence in a controlled environment, then exercise interactive paths before enforcing the policy. A generic wildcard added to suppress reports can erase the intended restriction.

[Content Security Policy rollout with report-only evidence](#read:fieldnotes-en-45)
