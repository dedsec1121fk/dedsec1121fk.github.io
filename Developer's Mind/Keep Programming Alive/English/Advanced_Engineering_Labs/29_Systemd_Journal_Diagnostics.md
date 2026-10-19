# A service can start successfully and still fail its first request

## Reconstruct the timeline
On a Linux system that actually uses systemd, `systemctl status` shows the current state and a selection of recent messages. `journalctl -u` can reveal the failure sequence with timestamps, but only for units whose logs are managed by the journal. Inspect the unit definition and the process's configured working directory before concluding that an executable is missing. A successful `active (running)` status is not a functional health check.

~~~sh
systemctl status example.service --no-pager
systemctl cat example.service
journalctl -u example.service -n 80 --no-pager
systemctl show example.service -p User -p WorkingDirectory -p ExecStart
~~~

## Four competing causes
A unit can fail because ExecStart names the wrong binary, the user lacks access to a directory, environment variables are absent, or an application crashes after launch. Record the first relevant message and compare it with the unit's service account. A command working in your interactive shell may depend on aliases or environment variables that the service never receives. Avoid adding broad root permissions to compensate.

## Test a local fixture
Create a harmless application that prints its working directory and exits intentionally with a nonzero code in a disposable user service. Inspect its exit status through the journal. Then fix only the declared working directory or executable path and verify the observed change. On Termux proot, do not assume systemd is PID 1: where this assumption fails, use the relevant guest/session process-management method.

## Close the case properly
Record the unit file path, exact state, effective user, first error timestamp, journal excerpt with sensitive fields removed and one successful application-level request. Only reload unit configuration after editing it, and restart the service only when authorized, because even a diagnostic restart can interrupt users.
## Working directory and environment differ from an interactive shell

A service that works in a terminal can fail under a service manager because it runs with another user, working directory, PATH or environment. Shell startup files are not a universal service configuration interface. Use explicit executable paths and documented environment inputs instead of relying on an administrator's interactive session.

When comparing environments, print only selected non-secret facts. Dumping every environment variable can expose tokens. The fixture isolates a child process with a controlled environment and directory, demonstrating why a relative filename or inherited variable can change behavior.

```python
import os, subprocess, sys, tempfile
with tempfile.TemporaryDirectory() as folder:
    result=subprocess.run([sys.executable,"-c",
        "import os; print(os.getcwd()); print(os.environ.get('APP_MODE'))"],
        cwd=folder,env={"APP_MODE":"fixture"},text=True,capture_output=True,
        timeout=2,check=True)
    lines=result.stdout.splitlines()
    assert lines == [folder,"fixture"]
print("service inputs explicit")
```

This is a subprocess fixture, not a claim that systemd exists on Android. For a real unit, inspect its effective user, WorkingDirectory, ExecStart and environment file permissions. Restrict log collection and redact secrets before sharing diagnostic output.

[Technical reference](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html)
