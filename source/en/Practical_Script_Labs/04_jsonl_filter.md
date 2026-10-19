# Practical scripts: JSONL, SHA-256 and workspace boundaries

## Filter a JSONL Stream

### One JSON value per physical line
04_jsonl_filter.py consumes an iterable of text lines and decodes each independently. Every decoded value must be an object with an integer level; booleans are rejected despite Python considering them integer subclasses. Rows with level below min_level are valid but filtered out, which differs from malformed records placed in errors.

### Inspect output, not just success
Run python 04_jsonl_filter.py. The provided sequence contains level 1, 3, invalid text, boolean true, level 2, and an empty line. With default threshold 2, accepted levels are [3,2] and error lines are [3,4,6]. It also tests a generator input and rejects min_level=True. Unlike JSON arrays, JSONL expects one independent document per physical line.

### Independent exercise
Consume a file using open(path, encoding="utf-8") and pass the open file object directly as an iterator. Add a maximum line length before json.loads so untrusted huge records do not exhaust memory. Decide whether blank lines should be skipped or reported; this implementation deliberately reports them. If you need to preserve discarded-but-valid rows, return a separate filtered count.

### Resource constraint
The input can be streamed without loading every original line, but accepted rows and error positions are accumulated in lists. For very large logs, yield accepted rows incrementally and send errors to a separate bounded sink. Source: 04_jsonl_filter.py; format: https://jsonlines.org/

## Verify Bytes with SHA-256

### Two distinct functions
sha256_bytes(data) digests an already loaded bytes object. sha256_file(path) reads a file in chunks of 65,536 bytes by default, avoiding loading a multi-gigabyte file into memory. The second function explicitly rejects zero, negative and boolean chunk_size values. Both return lowercase hexadecimal digests.

### Reproduce the reference vector
Run python 05_sha256_memory.py. SHA-256 of the three bytes abc must equal ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad. The test writes a file in a temporary directory, verifies hashing with one-byte chunks, changes one byte and confirms the digest changes. It also covers empty bytes. No third-party packages are used.

### Why a matching hash is not authentication
A digest establishes equality relative to a trusted expected value, but a malicious file and a matching malicious digest can be distributed together. For release downloads, obtain the expected hash or signature through authenticated, independent release metadata. Do not treat a matching hash from the same untrusted website as proof of publisher identity.

### Extended lab
Compare the chunked digest with hashlib.sha256(Path(...).read_bytes()) for a small fixture, then hash a larger synthetic file and measure peak memory. Be aware that the file may change while being read and that symlinks point to other files; hashing is not a filesystem sandbox. Source: 05_sha256_memory.py. Reference: https://docs.python.org/3/library/hashlib.html

## Keep Paths Inside a Workspace

### What allowed() actually checks
The function in 06_path_containment.py resolves a known existing root strictly. Relative candidate paths are resolved relative to that root, absolute candidates are handled as absolute, and containment is checked using actual Path parent components. This rejects a sibling named workspace-extra that would fool a naïve string startswith check.

### Safe fixture checks
Run python 06_path_containment.py. The script builds its own temporary workspace, then checks a real file, a relative file name, parent traversal, a similarly prefixed sibling path, and (if the OS supports creating it) a symlink escaping outside the workspace. Expected output is resolved containment checks passed (not race-free).

### Important trust limitation
The result is a snapshot. If an attacker can replace a symlink between resolve() and a later open(), a path initially considered inside may point outside. This time-of-check/time-of-use race makes allowed() insufficient to protect secrets from hostile filesystem writers. For that threat model, use directory-relative opening with appropriate OS facilities, no-follow policies and constrained capabilities, then validate the opened file descriptor.

### Exercise
Compare allowed(root, Path("hello.txt")) with allowed(root, Path("../escape.txt")). Confirm that the function raises when the root does not exist (strict=True). Create a link pointing outside and observe rejection; do not rely on this preflight as your only authorization control. Source: 06_path_containment.py. Path API: https://docs.python.org/3/library/pathlib.html
