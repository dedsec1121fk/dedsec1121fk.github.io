# Crash-safe checkpoints and file replacement

## Mechanism and contract

A checkpoint lets a restarted task resume from acknowledged work. Its data and its position must describe the same completed boundary: saving offset 500 before result 500 is durable can lose work. Saving the result first can cause replay, so design the result operation to tolerate duplicates. This is a recovery contract, not merely a file-writing trick.

For a single local JSON checkpoint, write to a temporary file in the destination directory, flush the language buffer, sync the file and replace the final name. Same-directory staging avoids cross-filesystem rename failures. Atomic name replacement prevents readers from seeing half of the new JSON; it does not coordinate competing writers. POSIX directory syncing is a separate durability step after replacement. Filesystems, network mounts and storage hardware can provide different guarantees.

## Worked local example

```python
import json, os, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as folder:
    root = Path(folder)
    target = root / "checkpoint.json"
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=root,
                                     delete=False) as staged:
        json.dump({"completed": 500, "schema": 1}, staged)
        staged.flush()
        os.fsync(staged.fileno())
    os.replace(staged.name, target)
    assert json.loads(target.read_text())["completed"] == 500
print("checkpoint readable")
```

## Failure checks and limits

The snippet demonstrates the write/replace sequence, not a power-loss simulation or complete POSIX directory durability. Test interruption before writing, after flushing and after replacement in an isolated harness. Restart should accept an old complete checkpoint or a new complete checkpoint, never infer progress from an incomplete temporary filename.

## Primary reference

[Official documentation](https://docs.python.org/3/library/os.html#os.replace)
