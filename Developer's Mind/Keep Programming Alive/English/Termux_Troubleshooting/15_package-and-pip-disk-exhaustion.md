# Disk exhaustion in Termux: measure packages, caches and temporary builds

## Cause and symptoms
Package installation can fail when private app storage, the target filesystem, or temporary build space fills. A pip wheel build may need substantially more temporary space than the eventual installed package. A full filesystem can corrupt interrupted downloads and leave partial files; the goal is to free space without deleting project sources or credentials.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
df -h "$HOME"
du -sh "$HOME" 2>/dev/null
python -m pip cache dir
python -m pip cache info
# Review candidates before any deletion.
# If appropriate after review: python -m pip cache purge
~~~

## Evidence-based repair
Measure which partition is full and where pip places temporary files. Review removable cache data separately from source repositories, databases and private configuration. pkg clean and pip cache purge may reclaim download/build caches when supported, but confirm what each command removes first. Avoid generic rm -rf commands or deleting $PREFIX directories. For repeatable rebuilds keep requirements locked and source backed up.

## Hands-on lab
Create a small directory of disposable files and estimate size with du; delete only that directory and verify the change. During a controlled pip download record available disk before/after and explain the difference between cache size, installed size and temporary build peak.
