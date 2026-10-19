# xonsh — consolidated language guide

## Xonsh

### Working model
Xonsh mixes a Python-oriented expression language with shell command invocation, so arguments and environment variables cross an explicit shell/Python boundary.

### Focused source example
```text
values = [4, 1, 4]
print(sorted(set(values)))
```

Compare a Python list transformation with a shell command that lists files; explicitly note which side performs variable expansion.

### Evidence to collect
Record the exact Xonsh compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Do not assume a shell pipeline emits a Python list without conversion; check subprocess exit status and encoding.

## Xonsh: applied exercises

### Test the Python half first
Xonsh allows Python expressions together with shell command syntax. A purely Python calculation is a useful baseline:

~~~python
values = [1, 2, 3]
squares = [n * n for n in values]
assert squares == [1, 4, 9]
print(sum(squares))
~~~

Predict a total of 14. Run this in an isolated Xonsh session and record the version. The computation does not require spawning a subprocess. It should not be described as command-line output parsing merely because it runs inside a shell.

### Then cross the process boundary
Use `echo hello` in the shell mode and inspect what appears on standard output. Compare with Python `print("hello")`: the observed text may look similar, but one route invokes a shell command and the other calls a Python function. Investigate subprocess capture expressions according to the installed Xonsh documentation, and separately record standard output, standard error and exit code. Missing commands are not the same as Python `NameError`.

### Controlled failure
Try an external command that is not installed, using a harmless invented name, and capture the real failure. Next, call a nonexistent Python variable in an expression. Identify which subsystem reported each error. Do not use a shell pipeline with `rm` or other destructive commands just to test error handling.

### Independent lab
Create a script that lists filenames from a temporary directory, converts their suffixes into a Python frequency dictionary, and reports a deterministic sorted result. Test an empty directory, a filename with Greek characters and a filename without a suffix. Preserve exact path strings; do not assume output from `ls` can safely be parsed on arbitrary filenames. Reference: https://xon.sh/

## Xonsh — Focused mastery pathway

### Inspect the language's real model
Combine a Python list comprehension with a read-only subprocess pipeline in Xonsh, keeping paths as distinct argument elements.

### Controlled failure and recovery
Test environment-variable retrieval and path quoting. Compare Xonsh subprocess syntax with ordinary Python subprocess.run and Bash word expansion.

### Independent practical assignment
Build a utility that scans one sandboxed directory and groups filenames by extension, refusing to execute filenames as commands. Pin Xonsh version when comparing syntactic forms.
