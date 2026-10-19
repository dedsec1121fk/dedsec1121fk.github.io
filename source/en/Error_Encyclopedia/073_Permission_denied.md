# Permission denied: determine which access was refused

## Recognize the actual failure
Permission denied may arise when opening a file, traversing a directory, executing a nonexecutable script or accessing Android shared storage. File read/write permission and directory execute (traverse) permission are distinct. Do not assume chmod 777 fixes a security policy or Android permission boundary.

## Inspect safely before changing anything
~~~sh
id
pwd
ls -ld -- .
ls -l -- target.sh
# Inspect before any chmod/chown.
~~~

## Repair the cause rather than suppressing the warning
Prefer invoking a readable shell script as bash target.sh if appropriate, or add execute permission only to files you own after checking their content. For Termux external storage, verify Android permissions and termux-setup-storage, but note that Android scoped-storage restrictions still apply. Windows ACL errors need Get-Acl rather than chmod.

**Reference:** https://man7.org/linux/man-pages/man2/access.2.html

## Identify which permission actually failed
~~~sh
id
ls -ld . ./example.sh
stat ./example.sh
~~~
A regular file needs execution permission for direct launch, but every parent directory also needs search/execute permission. Conversely, `bash ./example.sh` opens a readable script through Bash and can work even when direct execution is forbidden. Filesystems mounted `noexec` and Android shared storage add separate restrictions; `chmod +x` is not a universal fix.

## Minimal experiment
In a disposable directory create a two-line `example.sh` with `#!/bin/sh` and `printf 'ok\n'`. Try launching directly and through `sh ./example.sh` before/after granting user execute permission to *that specific file*. Expected behavior depends on the mount, interpreter availability and containing directory. Never use `chmod -R 777` or recursively change ownership to solve one error. For an error while opening a data file, inspect the parent directory and whether the process needs read or write access rather than executable access.
