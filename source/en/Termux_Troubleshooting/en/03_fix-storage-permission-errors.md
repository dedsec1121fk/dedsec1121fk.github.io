# Termux storage errors: distinguish Android grants, paths and noexec

## What causes the failure
Termux private storage under $HOME differs from Android shared storage. Running termux-setup-storage creates convenience links and requests Android permissions, but a grant does not turn /sdcard into a normal executable filesystem. Shared storage may deny executable bits, symlinks or paths due to Android scoped-storage rules. Keep development repositories and runnable scripts in $HOME; copy only input/output files to shared storage.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
printf 'HOME=%s\n' "$HOME"
ls -ld "$HOME" "$HOME/storage" 2>/dev/null
termux-setup-storage
ls -ld "$HOME/storage/shared" 2>/dev/null
# Prefer:
mkdir -p "$HOME/projects"
# Run projects from $HOME, not directly from /sdcard.
~~~

## Repair in evidence-based order
If permission was denied, inspect Android app permissions and repeat termux-setup-storage only after confirming the grant. Check the exact resolved path with pwd -P and ls -ld; do not assume a missing file is an access problem. If a script is on shared storage and cannot execute, copy it into $HOME and set permissions there. Avoid chmod 777 and avoid moving secrets to shared folders.

## Hands-on exercise
Create a harmless hello.sh in $HOME and run it with sh hello.sh. Copy to shared storage and compare whether direct execution and shell interpretation behave differently on your Android version. Record path, errno and permission state without changing Android system settings globally.
