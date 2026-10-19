# Termux Python imports: match the running interpreter and installation target

## What causes the failure
A successful pip install does not prove that the running Python process can import the requested module. PATH may select another Python, pip may belong to a different environment, the import name may differ from the distribution name, and local filenames may shadow installed packages. For native extensions, an Android/Termux ABI mismatch is different from ModuleNotFoundError.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
python -c 'import sys; print(sys.executable); print(sys.version)'
python -m pip --version
python -m pip list
python -c 'import importlib.util; print(importlib.util.find_spec("json"))'
# For your target package, inspect:
# python -m pip show PACKAGE
~~~

## Repair in evidence-based order
Use python -m pip, not an ambiguous bare pip, and install dependencies only into the environment that launches the app. In Termux check pkg search before forcing system-level Python package changes. Avoid sudo and do not mix wheel files built for desktop Linux with Android. For reproducibility record a project requirements file and exact interpreter.

## Hands-on exercise
Create two isolated Python environments with different installed toy distributions or use the stdlib as control. Record sys.executable and importlib.util.find_spec before and after switching. Add a local json.py in a disposable directory and observe module shadowing, then remove it.
