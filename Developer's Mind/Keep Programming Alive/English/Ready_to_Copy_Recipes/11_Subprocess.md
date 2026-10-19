# Recipe: safe subprocess argument vectors and timeouts

## Scenario and acceptance criteria
A developer utility sometimes needs to invoke another installed program. Separate the executable and each argument in a list, pass untrusted-looking text as a literal argument, and set a finite timeout. The test uses the current Python interpreter as its child and verifies that shell metacharacters are printed unchanged rather than interpreted by a command shell.

## Complete executable example
Save as `11_Subprocess.py` and run with Python 3 and the standard library. The fixture works without internet or access to your real files.

~~~python
import subprocess, sys
argument="literal; $(echo NOT_EXECUTED) & α"
command=[sys.executable,"-c","import sys; print(sys.argv[1])",argument]
result=subprocess.run(command,check=True,text=True,capture_output=True,timeout=3)
assert result.stdout.strip()==argument
assert result.returncode==0
slow=[sys.executable,"-c","import time; time.sleep(5)"]
try:
    subprocess.run(slow,check=True,capture_output=True,timeout=0.1)
except subprocess.TimeoutExpired:
    pass
else:
    raise AssertionError("timeout not enforced")
print("PASS literal argv and bounded child process")
~~~

## Technical explanation
With the default shell=False, subprocess.run passes an argument vector directly to the executable on supported platforms. The string containing `;`, `$()` and `&` is one argument to Python, not a separate command. `check=True` raises CalledProcessError for a nonzero child exit, and TimeoutExpired signals when the process exceeded the time limit. This does not automatically make the child executable trustworthy: validate its source, permissions and expected behavior.

## Bounded practice
Pass an argument containing spaces, quotes and an emoji; inspect the child's argv. Change the child to exit code 7 and capture CalledProcessError. Add an output-size bound if invoking an untrusted process, since capture_output can buffer large output in memory. Confirm the executable path is fixed rather than taken from attacker-controlled user input.

## Diagnostics and safety
If arguments unexpectedly split, check whether a shell or manually joined command string was introduced. If timeout occurs, report the elapsed budget and failure without silently retrying an unsafe action. On Windows, process creation and quoting differ from POSIX; test on the target platform instead of assuming identical behavior.
