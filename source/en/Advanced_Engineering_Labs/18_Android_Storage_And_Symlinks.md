# Android storage is not an ordinary Linux home directory

## Two distinct namespaces
Termux's private `$HOME` and `$PREFIX` support executable scripts, permissions and Unix-style tools. Android shared storage, often reached through `$HOME/storage/shared`, is mediated by platform permissions and filesystem layers. Running source code or placing Unix sockets in shared storage can fail even when reading a photograph works. Keep active project repositories under `$HOME` and export finished media to shared storage when required.

~~~sh
printf 'HOME=%s\nPREFIX=%s\n' "$HOME" "$PREFIX"
pwd
ls -ld "$HOME" "$HOME/storage" "$HOME/storage/shared" 2>&1
stat "$HOME" 2>&1
~~~

## Establish access safely
`termux-setup-storage` requests the Android storage permission and sets up convenience paths where supported. A denied prompt must be fixed through Android's application permissions, not by giving every file mode 777. `ls -l` and `readlink` can identify symbolic links; a dangling path is different from a refused access operation. Shared folders may differ across Android versions, so treat their availability as an observation to confirm, not a guarantee.

## A small separation test
Create a harmless file inside a temporary project directory under `$HOME`, write one word and read it back. Then try copying that file into a user-approved shared folder. A failure only on the second operation points to storage access or filesystem behavior, not a broken Python installation. Record both paths, Android version and whether the permission prompt was accepted.

## Preservation rule
Never run recursive permission changes or deletion commands on all of `/storage` or `$HOME` to “fix access.” If an app must consume a file from Downloads, validate that path and copy only that file into its project-owned working directory. Avoid treating Android's scoped-storage boundaries as root access problems.
