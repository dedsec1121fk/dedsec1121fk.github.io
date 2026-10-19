# Missing files and Python module troubleshooting

## No such file or directory

**Language / environment:** Shell / Linux

### Meaning
A file or folder path cannot be resolved.

### Repair
Inspect quoting, working directory, case-sensitive names and mount permissions.

## ModuleNotFoundError: flask

**Language / environment:** DedSec

### Meaning
Flask is unavailable in the Python interpreter that launched the script.

### Repair
Use DedSec .venv on Linux or Termux setup Python; verify python -c "import flask".

## No module named flask_socketio

**Language / environment:** DedSec

### Meaning
The Flask-SocketIO package is missing from the selected environment.

### Repair
Run appropriate setup for the selected platform and import flask_socketio in the same interpreter.

## A repeatable diagnosis for Python module failures

Run the failing program and the diagnostic code with the exact same Python executable. Print `sys.executable`, `sys.version`, `Path.cwd()` and inspect the absolute location of the imported package. A package installed into one virtual environment is not necessarily importable from another interpreter. If `flask` or `flask_socketio` cannot be imported, compare the interpreter's `-m pip` output with the environment that actually launches the application, and verify that the project declares the dependency.

~~~python
from pathlib import Path
import sys
print(sys.executable)
print(Path.cwd())
print((Path.cwd() / "config.json").resolve())
~~~

A missing relative file usually points to a working-directory or deployment-layout problem, not missing permissions. Test the program from a separate directory, then use a known location such as the script's parent when appropriate. For `flask_socketio`, the package distribution name and Python import name need not be identical; consult the installed package metadata before changing source imports. Keep the actual exception trace and interpreter version in your report.

## Proof before closing the incident

After correcting either the package environment or resource path, repeat the original import/read operation. Test one missing-path case and one existing file with synthetic contents. Record which executable was used and avoid running administrator-level commands merely to silence the error.
