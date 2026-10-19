# Python venv recovery after moves, upgrades or broken activation

## Cause and symptoms
Python virtual environments often contain absolute paths to an interpreter and should not be treated as portable archives across devices or major interpreter changes. An apparently active shell environment may still run another python binary because of PATH. Preserve reproducible requirements and project source separately from disposable venv directories.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
python -c 'import sys; print(sys.executable)'
python -m pip --version
python -m venv "$HOME/venv-lab"
. "$HOME/venv-lab/bin/activate"
python -c 'import sys; print(sys.prefix, sys.base_prefix)'
deactivate
# Never overwrite the only copy of dependency specifications.
~~~

## Evidence-based repair
If the old interpreter path no longer exists or activation is inconsistent, first export dependency names and versions from a working environment or recover from requirements/lock files. Recreate a new venv using the currently installed Python and reinstall supported dependencies. Do not copy bin/python or site-packages blindly between Android and desktop architectures. Review native wheels carefully.

## Hands-on lab
In a disposable project create a venv, inspect its pyvenv.cfg and sys.executable, and move it to another folder. Record whether scripts still reference the original location. Recreate instead of repairing unknown binary paths manually.
