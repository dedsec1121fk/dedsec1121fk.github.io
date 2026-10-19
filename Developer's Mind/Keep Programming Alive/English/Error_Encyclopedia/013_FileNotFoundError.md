# Python FileNotFoundError: locate the missing resource without guessing

FileNotFoundError is raised when a requested path does not name an existing resource from the process's filesystem view. The error may arise in open(), pathlib operations, subprocess startup, or a dependency. A relative path is resolved against the current working directory, not automatically against the Python script's directory.

## A safe read-only diagnosis

~~~python
from pathlib import Path

cwd = Path.cwd()
script_dir = Path(__file__).resolve().parent
relative = Path("samples") / "input.txt"
print("working directory:", cwd)
print("script directory:", script_dir)
print("cwd candidate:", (cwd / relative).resolve())
print("script candidate:", (script_dir / relative).resolve())
print("exists beside script:", (script_dir / relative).is_file())
~~~

Running the script from another directory can change the cwd candidate while the script candidate remains anchored to the file. For a resource distributed alongside source code, using a deliberate script/package-relative location is more reliable than assuming the user launched the program from a fixed folder. Libraries and packaged applications may use different resource APIs, so inspect the actual deployment layout.

## Reproduce a missing file without destructive writes

In a disposable test folder, request a name that is known not to exist. First check is_file(), then attempt a read, and capture FileNotFoundError with the requested path in the error report. Next add a small UTF-8 fixture with the expected content and verify that the read succeeds. Don't create an empty replacement for an unknown configuration file merely to suppress the exception.

## Permissions, filename case, and platform distinctions

A real file that lacks read permission usually leads to PermissionError rather than FileNotFoundError, although inaccessible parent directories or network mounts complicate diagnosis. Linux and typical Termux filesystems are case-sensitive; Windows configurations can differ. Also distinguish a broken symlink from a normal missing filename. Before changing source paths, confirm the process identity, working directory and path received by the failing function.

## Completion check

Record the exact exception, two resolved candidate paths, expected fixture contents, and a successful read from the intended location. Include OS and package layout. If no test was executed, label outputs as expected rather than claiming verified success. Correcting this error requires choosing the right resource location, not indiscriminately changing permissions.
