# Sandbox — separate a working folder from a security boundary

## What this term means
A sandbox restricts what a process can observe or modify, usually by constraining system calls, filesystem access, credentials, namespaces, permissions or network routes. A temporary folder, Python virtual environment, Git branch and browser private window are **not** by themselves security sandboxes for hostile programs.

## Safe contrast: scratch directory, not isolation
~~~python
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as root:
    workspace = Path(root)
    file = workspace / "sample.txt"
    file.write_text("training data", encoding="utf-8")
    assert file.read_text(encoding="utf-8") == "training data"
~~~
This snippet organizes disposable **trusted** work. It does not prevent the same Python process from reading other paths accessible to its OS user. Do not execute unknown binaries or unreviewed scripts inside it and assume safety.

## Design a real boundary
For an offline lesson viewer, the safe default is *render inert lesson text*. If code must be executed, prefer a separately provisioned operating-system sandbox or VM, restrict writable mounts, block network egress where not required, use an unprivileged identity, set CPU/time/memory limits and provide no credentials. The exact controls depend on Android/Termux versus desktop Linux versus Windows. A phone app's Android sandbox is not equivalent to rootless Linux namespaces.

## Adversarial verification
1. Make a permissions table: lesson reader can read packaged lessons but cannot write outside an approved scratch area.
2. Attempt a harmless write into a deliberately protected test directory **inside a disposable test environment** and expect a denied operation.
3. Confirm the sandbox cannot reach an example local service when network access is disabled. Do not probe systems you do not own.
4. Confirm that timeout/cancellation stops runaway work, and document what happens to children.
5. Review whether diagnostic logs or exceptions expose secrets from the host.

## Evidence
List the real isolation mechanism, OS version, mount/network privileges and both positive and denied tests. If you only used TemporaryDirectory, describe it as cleanup, not isolation.
