# Python externally managed: preserve the system interpreter

## Recognize the actual failure
PEP 668 allows an OS-managed Python installation to tell pip not to install into the interpreter's global environment. This avoids conflicts with distro-managed packages. The diagnostic is a policy boundary, not evidence that pip or Python is corrupted.

## Inspect safely before changing anything
~~~sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install PACKAGE
~~~

## Repair the cause rather than suppressing the warning
Install the distribution's python3-venv package if needed on Debian/Ubuntu. On Termux inspect its Python packaging rules; do not blindly apply Debian package names. Avoid --break-system-packages as an everyday fix: it bypasses a protection and may damage distro tooling. Use pipx for isolated CLI applications where available.

**Reference:** https://peps.python.org/pep-0668/

## Work with a project-owned environment
PEP 668 distinguishes OS-managed Python installations from application dependencies. The safe default for a project is an isolated environment:
~~~sh
python3 -m venv .venv
.venv/bin/python -m pip --version
.venv/bin/python -m pip install requests
~~~
This installs into the temporary/project venv rather than overwriting distro-managed Python packages. On Windows use `.venv\Scripts\python.exe`; some Linux distributions require their venv support package first. Check `sys.executable` inside the project to make sure your editor and CI use the same interpreter.

## Stop the misleading fixes
Do not recommend `--break-system-packages` as the first fix. It opts out of protection and may damage system tooling. For CLI tools, consider `pipx` when supported. Termux is not simply Ubuntu on Android; inspect the actual package manager and Python installation rather than assuming that the same PEP 668 marker is present.
