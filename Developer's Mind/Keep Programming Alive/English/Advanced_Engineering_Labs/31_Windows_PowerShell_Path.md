# Windows command resolution has distinct layers

## Inspect which executable will run
PowerShell aliases, functions and commands can shadow binaries with the same short name. The Python launcher (`py`) may select a different installed interpreter than the `python` command on PATH. A package installed with one interpreter will not necessarily be available through the other. Check the command type and executable path before changing environment variables or reinstalling Python.

~~~powershell
Get-Command python -All
Get-Command py -All
where.exe python
py -0p
python -c "import sys; print(sys.executable)"
~~~

## When a virtual environment appears broken
A venv created on one computer may contain interpreter paths that do not exist on another; recreate it from the dependency manifest rather than copying its whole directory. PowerShell activation can also be affected by execution policy, but launching `.venv\Scripts\python.exe` directly often avoids activation entirely. Do not disable Windows security features globally merely to run one script.

## Different errors, different responses
“Python not found” suggests command discovery or installation. “ModuleNotFoundError” after Python starts suggests packages installed into the wrong interpreter, a shadowed module name or missing dependency. An “Access denied” on a downloaded executable involves rights or file blocking rather than a Python syntax error. Inspect the full error and the path involved.

## End-to-end exercise
Create a disposable Python project with a requirements file and a fresh venv. Print `sys.executable`, install one harmless dependency using that binary's `-m pip`, and run a simple import test. Record Windows version, architecture and exact launcher choice. Validate without administrator rights whenever the project doesn't require them.

## Run the chosen interpreter without activation
~~~powershell
& .\.venv\Scripts\python.exe -c "import sys; print(sys.executable); print(sys.prefix)"
& .\.venv\Scripts\python.exe -m pip --version
~~~
PowerShell's call operator `&` is especially useful for an executable path held in a variable or containing spaces. Activating a venv changes the current shell environment; it is not required to invoke that interpreter directly. The legacy `py -0p` listing is not supported by every launcher implementation, so inspect `py --help` if that option is rejected.

## Change the narrowest scope and verify a new shell
`$env:Path` changes the current process environment. User-level and machine-level environment settings have different persistence and authority. Existing shells do not automatically receive all changes made elsewhere. After a deliberate PATH edit, open a fresh shell, run `Get-Command python -All`, then print `sys.executable` again. Preserve unrelated PATH entries and never replace the entire value merely to add a project tool.

Test a path containing spaces and a local file named `json.py`: the latter can shadow Python's standard library independently of PATH. The resolution chain includes both shell command lookup and Python module lookup; recording only the first leaves half the diagnosis unexplained.
