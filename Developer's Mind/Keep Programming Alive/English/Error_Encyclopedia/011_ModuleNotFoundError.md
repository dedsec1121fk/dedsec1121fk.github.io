# ModuleNotFoundError: resolve the exact Python environment

## What fails and when
A ModuleNotFoundError often means that the interpreter running the program cannot see an installed distribution; it does not prove the package is absent from every interpreter on the device. It can also mean the import name differs from the pip distribution name, a virtual environment is inactive, or project files shadow packages.

## Self-contained executable example
Save this as 011_ModuleNotFoundError.py and run `python3 011_ModuleNotFoundError.py`. The example checks both the error and a valid case.

~~~python
import importlib.util
import sys
from pathlib import Path
print("interpreter:", sys.executable)
print("cwd:", Path.cwd())
print("json location:", importlib.util.find_spec("json").origin)
assert importlib.util.find_spec("json") is not None
assert importlib.util.find_spec("_dedsec_missing_fixture_") is None
~~~

## Diagnostic sequence and safe repair
Run python3 -c 'import sys; print(sys.executable)' with the exact launcher used by the app. Then python3 -m pip --version and python3 -m pip show PACKAGE. Inspect sys.path and project filenames. In Termux use its Python and site-packages; do not mix Termux installations with system or unrelated Debian environments. Install only into the intended environment, ideally a project venv.

## Practical lab and boundary test
Make an isolated venv, print its sys.executable and inspect find_spec for a standard-library module. Explain why invoking plain pip from another terminal could update a different interpreter. Test an intentional misspelling without installing anything.

## Reproduce interpreter visibility without installing anything
Use the interpreter that is running this very script for both an intentionally absent module and a standard-library control. The -I switch isolates Python from user-site packages and most environment influences; it is useful for diagnosis, but it is not equivalent to the application's normal import path.

~~~python
import sys, subprocess
missing_module = 'dedsec_missing_fixture_9f8a6d71'
missing_run = subprocess.run(
    [sys.executable, '-I', '-c', 'import '+missing_module],
    capture_output=True, text=True)
control_run = subprocess.run(
    [sys.executable, '-I', '-c', 'import json; print(json.dumps([1, 2]))'],
    capture_output=True, text=True)
assert missing_run.returncode != 0 and 'ModuleNotFoundError' in missing_run.stderr
assert control_run.returncode == 0 and control_run.stdout.strip() == '[1, 2]'
~~~

## Interpreter, distribution, and shadowing checklist
Record sys.executable from the failing process, then run that exact executable with -m pip show DISTRIBUTION. Import names can differ from distribution names. Check local filenames such as json.py and directories on sys.path before reinstalling. If a module works normally but not with -I, inspect user-site packages, PYTHONPATH and working-directory assumptions. Mastery means explaining why a successful pip installation in one virtual environment does not prove visibility in another.
