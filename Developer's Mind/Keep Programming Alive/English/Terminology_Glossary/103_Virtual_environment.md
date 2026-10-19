# Python virtual environment — dependency isolation versus machine isolation

## Definition and limits
A Python virtual environment holds its own interpreter entry points and site-packages location, selected via a pyvenv.cfg file and interpreter prefix. It reduces accidental dependency conflicts between projects, but **does not sandbox installed packages from the operating system**. A package executed inside a virtual environment can still read files and access the network with the permissions of its user. It is not equivalent to a container or a security boundary.

## Portable Python 3 verification
Save this file as virtual_env_lab.py (do **not** name it venv.py, which would shadow the Python standard library). Run python3 virtual_env_lab.py. The example creates an isolated environment with no pip bootstrap in a disposable temporary directory, invokes its interpreter using an absolute path and compares sys.prefix against sys.base_prefix. Temporary files are cleaned up by the context manager.

~~~python
import json
import os
from pathlib import Path
import subprocess
import tempfile
import venv

with tempfile.TemporaryDirectory() as directory:
    target = Path(directory) / 'isolated'
    venv.EnvBuilder(with_pip=False, symlinks=False).create(target)
    interpreter = target / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    assert interpreter.is_file()
    probe = 'import json,sys; print(json.dumps({"prefix":sys.prefix,"base":sys.base_prefix,"path":sys.executable}))'
    result = json.loads(subprocess.check_output([str(interpreter), '-c', probe], text=True))
    assert Path(result['prefix']).resolve() == target.resolve()
    assert result['prefix'] != result['base']
    assert Path(result['path']).is_file()
    print('PASS virtual environment: isolated interpreter prefix')
~~~

## Why the interpreter path is reliable
The Python documentation defines sys.prefix as the active installation prefix and sys.base_prefix as the base environment. Within a virtual environment, the two normally differ. Invoking the environment interpreter by path avoids guessing whether shell activation succeeded. On Windows the interpreter is under Scripts/python.exe; on Linux/Termux it is usually under bin/python. Activation modifies shell environment conveniences, but is not required when directly invoking the interpreter. This test does not install third-party packages or use internet access.

## Failure reproduction and exercises
1. Deliberately rename the script venv.py in a disposable folder: observe import shadowing (missing EnvBuilder) and then rename the file. Clear any stale __pycache__ before rerunning.
2. Compare sys.executable, sys.prefix and sys.base_prefix inside/outside; write down exactly which are expected to change.
3. Run python -m pip --version using the environment interpreter **only when pip was installed**. Explain why installing into a different Python can make an import fail.
4. Explain why running untrusted pip install inside a virtual environment still poses filesystem and credential risks.

**Evidence:** PASS, interpreter paths from both environments, a reproduced shadowing diagnosis and the reason this feature is dependency isolation rather than a security sandbox.
