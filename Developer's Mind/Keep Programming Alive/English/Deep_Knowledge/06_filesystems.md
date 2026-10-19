# Filesystem replacement — preserve the last good report

## Scenario and acceptance criteria
An offline tool exports a report to one chosen file. If the operation fails after writing temporary content, the existing report must still contain the old bytes. A successful replacement must leave the new content and remove scratch files. Keep the temporary file in the same directory as the destination, because a move across filesystems may not be atomic.

## Executable lab — Python 3 standard library
Save the example as `06_filesystems.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
import os, tempfile
from pathlib import Path
def replace_text(target, text, fail_before_replace=False):
    target = Path(target)
    if target.is_symlink():
        raise ValueError("symbolic-link target refused")
    temp_name = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                dir=target.parent, prefix=".new-", delete=False) as out:
            temp_name = out.name
            out.write(text)
            out.flush()
            os.fsync(out.fileno())
        if fail_before_replace:
            raise OSError("injected interruption")
        os.replace(temp_name, target)
        temp_name = None
    finally:
        if temp_name is not None:
            Path(temp_name).unlink(missing_ok=True)
with tempfile.TemporaryDirectory() as location:
    target = Path(location) / "report.txt"
    target.write_text("old", encoding="utf-8")
    try: replace_text(target, "partial", True)
    except OSError: pass
    assert target.read_text(encoding="utf-8") == "old"
    replace_text(target, "new")
    assert target.read_text(encoding="utf-8") == "new"
    assert not list(Path(location).glob(".new-*"))
print("PASS file replacement")
~~~

## Technical explanation
NamedTemporaryFile, flush and fsync address different stages: writing Python buffers, pushing bytes toward the filesystem and then replacing the old name with os.replace. Replacing a directory entry is not identical to a fully durable transaction after power loss; some systems require an fsync of the containing directory. Checking target.is_symlink reduces accidental following of a pre-existing link, but does not eliminate time-of-check/time-of-use races against hostile concurrent changes.

## Bounded practice
Run the injected interruption and verify report.txt stays 'old'. Then run the successful path and ensure no .new-* files remain. Test a Unicode report, an unwritable output directory and a target that is a symlink inside a temporary fixture. For an untrusted root, design a descriptor-relative strategy rather than trusting simple string prefix comparisons.

## Diagnostics and completion evidence
If os.replace raises EXDEV, the temporary and target files probably reside on different filesystems; do not silently fall back to a destructive copy. If fsync fails, propagate the error and preserve the existing destination. The example tests an individual file, not multiple files updated transactionally.
## Further engineering detail

For resumable jobs, the file replacement boundary must agree with the completed-work boundary. Advancing a checkpoint too soon loses work; advancing it afterward can replay work. Prefer replay-safe outputs and test interruption at each persistence step, rather than assuming an atomic filename change makes the entire job transactional.

[Crash-safe checkpoints and file replacement](#read:fieldnotes-en-35)
