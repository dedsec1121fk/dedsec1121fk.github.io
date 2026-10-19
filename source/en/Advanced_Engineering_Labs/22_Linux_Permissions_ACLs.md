# Do not solve access failures by making everything world-writable

## Describe the exact operation
The operating system checks different privileges for reading a file, entering a directory, creating a new entry and executing a program. Begin with the failing filename, process identity and action; `ls -l` on the final file is incomplete if a parent directory lacks search permission. ACLs and mount flags can further constrain access even if ordinary mode bits appear correct.

~~~sh
id
namei -l ./example/path 2>/dev/null || true
ls -ld . ./example 2>/dev/null || true
findmnt -T . -o TARGET,FSTYPE,OPTIONS 2>/dev/null || true
~~~

## Separate authority from symptoms
A script can be readable and still fail direct execution on a `noexec` mount. A directory may permit listing but not traversal, depending on modes and ACLs. An executable invoked by an interpreter (for instance `python script.py`) follows different checks from `./script.py`. `getfacl` is useful if installed, but absence of that utility is not evidence no ACL exists.

## Controlled fixture
In a disposable directory belonging to you, create one regular text file and show read access. Then change only its permissions and compare `stat` and the result under the same user. Restore the original mode before finishing. Avoid using recursive `chmod -R 777`, global ownership changes or administrator execution as shortcuts.

## End with least privilege
The correct fix might be moving project output to a user-writable directory, granting a specific group read permission, or correcting a directory's ownership via the authorized administrator. Capture before/after results for the same operation and explain why broader permissions would be unnecessary.

## Directory permissions change the meaning of the operation
Reading a file checks its read permission plus traversal on parent directories. Creating or deleting a directory entry requires appropriate rights on the parent directory, not simply write permission on the file. Deleting a writable file and editing its bytes are different operations; sticky directories add further restrictions. ACL masks can reduce the effective rights of named users or groups, so inspect the effective result rather than adding mode bits at random.

## Reproducible permission experiment
In a new temporary directory, create `note.txt`, record its original mode, remove only its owner-read bit and attempt the same read under the same account. Restore the mode in a finally/cleanup path. If the test runs as root or with a relevant capability, it may still succeed: that is an account-context result, not proof that mode bits are irrelevant. Repeat as an ordinary account before drawing conclusions.

An interpreter reading `python note.py` is different from executing `./note.py`; the first still needs readable source and an executable interpreter. Neither pattern gives Android apps access outside their sandbox. On shared Android storage, place the project in Termux-private storage when it needs Unix execution or symlink behavior.
