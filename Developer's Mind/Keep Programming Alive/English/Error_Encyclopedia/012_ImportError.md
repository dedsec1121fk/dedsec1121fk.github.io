# ImportError: separate absent modules, symbols and cycles

## What fails and when
ImportError can occur after Python locates a module but fails to import a requested symbol, loads an incompatible compiled extension or encounters a circular import during initialization. ModuleNotFoundError is a more specific subclass used when a module cannot be found. Installing packages repeatedly will not repair a wrong symbol name or cyclic dependency.

## Self-contained executable example
Save this as 012_ImportError.py and run `python3 012_ImportError.py`. The example checks both the error and a valid case.

~~~python
import importlib
import math
assert hasattr(math, "sqrt")
try:
    exec("from math import sqrt_typo")
except ImportError as exc:
    assert "sqrt_typo" in str(exc)
else:
    raise AssertionError("missing name imported")
assert importlib.import_module("math").sqrt(9) == 3.0
~~~

## Diagnostic sequence and safe repair
Read the full import traceback and the module path, not only the final line. Check python3 -c 'import module; print(module.__file__)' for file-backed modules, installed API versions and exported names. If the message says partially initialized module, sketch the import dependency graph and move shared definitions to a third module. Avoid naming local files json.py, typing.py or requests.py.

## Practical lab and boundary test
Create a.py importing b and b.py importing a, with each accessing an attribute before initialization. Observe the circular-import diagnostic, then refactor shared constants into common.py. Contrast the result with a simple misspelled imported symbol.

## A missing export, reproduced in a disposable directory
This fixture distinguishes a module that exists from a name it does not export. It creates two local files, runs them in a fresh Python process, then adds the missing symbol. No pip install or external dependency is involved.

~~~python
import sys, subprocess, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as temp:
    folder = Path(temp)
    helper = folder / 'helper.py'
    main = folder / 'main.py'
    helper.write_text('VALUE = 3\n', encoding='utf-8')
    main.write_text('from helper import MISSING\nprint(MISSING)\n', encoding='utf-8')
    def run():
        return subprocess.run([sys.executable, str(main)],
                              cwd=folder, capture_output=True, text=True)
    broken = run()
    assert broken.returncode != 0 and 'ImportError' in broken.stderr
    helper.write_text('VALUE = 3\nMISSING = 5\n', encoding='utf-8')
    fixed = run()
    assert fixed.returncode == 0 and fixed.stdout.strip() == '5', fixed.stderr
~~~

## How to tell the causes apart
The first run finds helper.py but cannot import MISSING. A ModuleNotFoundError instead indicates a module name could not be resolved; a partially initialized module warning suggests a cycle. For a real failure, inspect the imported module's __file__, its public exports and the first importing frame. Finish by creating a two-module cycle and moving shared definitions into common.py; explain why renaming or reinstalling a package would not repair that cycle.
