# Installed is not the same as importable or runnable

## Trace the interpreter used by the failing command
A command launched by an IDE, scheduled task, shell alias or shebang may use a different Python than your terminal. First print `sys.executable`, the major/minor Python release and the location of the imported module. Use the **same** interpreter for `-m pip`; a bare `pip` on PATH can refer to a different installation.

~~~sh
python -c 'import sys,site;print(sys.executable);print(sys.version);print(site.getsitepackages())'
python -m pip --version
python -m pip show requests
python -c 'import importlib.util;print(importlib.util.find_spec("requests"))'
~~~

## Separate four diagnoses
ModuleNotFoundError may mean a package is absent in the active interpreter, that your project shadows its name, or that an optional import path is unavailable. ImportError can arise inside an installed package. A native extension may fail only at load time if its architecture or ABI does not match. `python -m pip check` checks declared dependency relationships but cannot certify that binary imports or APIs work on the target platform.

## Exercise with controlled shadowing
In a disposable folder, name a file `json.py` and attempt to run code importing Python's standard `json` module. Inspect the imported module's `__file__` when available. Rename that local file and remove only its own stale cache; do not delete the entire system cache. This demonstrates why working directory and filenames matter beyond package installation.

## Repair and acceptance
Choose the correct interpreter, use a project-local virtual environment where available, install declared dependencies from trusted sources, and run a minimal API call plus your project's tests. Capture OS, architecture, Python version and pip's reported version. A successful `pip install` is necessary for some repairs, but not proof the original application now works.
