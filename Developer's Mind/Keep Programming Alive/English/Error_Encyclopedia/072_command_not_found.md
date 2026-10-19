# command not found: diagnose executable discovery

## Recognize the actual failure
The shell searches executable names through PATH unless the user supplies an explicit path. The program may not be installed, PATH may omit its directory, the name may be misspelled, or the script may use a command available only in another OS. Installing a package is not always the correct first step.

## Inspect safely before changing anything
~~~sh
printf '%s\n' "$PATH"
command -v python
command -v python3
uname -s
~~~

## Repair the cause rather than suppressing the warning
On Termux use its own pkg repository, not arbitrary Debian apt instructions. Check pkg search NAME and pkg show PACKAGE before installing. In PowerShell inspect Get-Command NAME and $env:Path instead; cmd.exe uses where NAME. Do not prepend '.' or a world-writable directory to PATH as a shortcut.

**Reference:** https://www.gnu.org/software/bash/manual/html_node/Command-Search-and-Execution.html

## Prove whether the executable or PATH is wrong
~~~sh
printf 'PATH=%s\n' "$PATH"
command -v python3 || printf 'python3 absent from PATH\n'
type -a python3 2>/dev/null || true
~~~
Run the same checks in an interactive shell and the failing script or CI job. If one succeeds, print both environments rather than installing the language again. Explicit relative paths such as `./script.sh` bypass PATH lookup; they can then fail with a different execution error. The same diagnostic on PowerShell is `Get-Command python -All`; on cmd.exe use `where python`.

## Resolve portability deliberately
On Termux search the supported `pkg` catalogue rather than following Linux distribution apt instructions blindly; Android's filesystem and package layout are not a desktop distro. Prefer invoking `python3 -m pip` with the interpreter you actually located. If a command exists only inside a virtual environment, activate it or use the environment's direct executable path. Never add the current directory to the start of PATH to silence this failure: it makes accidental executable substitution easier.
