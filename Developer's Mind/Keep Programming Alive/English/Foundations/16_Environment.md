# Reproducible Python environments on Linux, Windows, and Termux

When one Python process imports a package successfully and another reports ModuleNotFoundError, the first question is which interpreter each process uses. A virtual environment isolates a project from system-wide libraries, but it does not automatically solve CPU architecture, operating-system support, or unavailable native dependencies.

## Inspect before installing anything

~~~python
import sys
import platform
from pathlib import Path

print(sys.executable)
print(sys.version.split()[0])
print(platform.system(), platform.machine())
print(Path.cwd())
~~~

Save this as inspect_env.py and run it through the exact interpreter used by the failing application. sys.executable identifies the running Python binary; the shell prompt alone is not reliable evidence that the right virtual environment is active. Path.cwd() is the working directory, which may differ from the script's location.

## Use a project-owned interpreter when supported

On desktop Linux, a standard option is creating a venv using python3 -m venv .venv, then running .venv/bin/python -m pip --version. On Windows its interpreter normally lives under .venv\Scripts\python.exe. The module invocation ensures pip belongs to the interpreter named before -m. Some systems require separately installing venv support. On Termux, Python is supplied through its own pkg repository; confirm availability of venv and compatible wheels on that installation rather than copying distro-specific fixes.

## Two failures that look similar but aren't

If pip says a requirement is installed, yet the application can't import it, compare the pip interpreter, sys.executable, and project launch command. A package might instead import but fail later because a native library is absent: installing it into the correct venv is then necessary but not sufficient. For a dependency with compiled extensions, the Python ABI and Android/Linux/Windows platform tags matter.

## Practical investigation

Create an empty disposable project with inspect_env.py, print the values in a system interpreter and a project venv, and note which paths differ. Then record a minimal dependency manifest and rebuild the environment without copying the original site-packages folder. Compare interpreter version, dependency version, OS and architecture. Report observed outputs separately from predictions; passing installation alone is not proof the whole application works.

## Cross-platform and accessibility

Do not assume Android tools exist on Ubuntu, or Windows paths exist on Termux. Test real input devices and screen readers where applicable. For command-line menus, support keyboard flow and preserve exit behavior.

### Worked example

```text
import sys
from pathlib import Path
print(sys.platform)
print(Path.home())
```

### Practice

Describe why hard-coding /storage/emulated/0 fails on desktop Linux.

### Corrected result / hint

The Android path is not present on a normal Linux machine.
