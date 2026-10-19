# Recipe: check shell syntax without executing unknown scripts

## Scenario and acceptance criteria
When reviewing a Bash script from an offline knowledge bundle, start with a syntax-only parse rather than executing it. `bash -n` can detect an unmatched `if` and many grammar mistakes without running ordinary shell statements. The fixture creates one valid and one broken script in a disposable folder and checks their exit status.

## Complete executable example
Save as `08_Shell_check.py` and run with Python 3 and the standard library. The fixture works without internet or access to your real files.

~~~python
import shutil, subprocess, tempfile
from pathlib import Path
bash = shutil.which("bash")
if bash is None:
    raise SystemExit("SKIP: Bash executable not present")
with tempfile.TemporaryDirectory() as folder:
    good = Path(folder)/"good.sh"
    broken = Path(folder)/"broken.sh"
    good.write_text('echo "This is never executed"\n',encoding="utf-8")
    broken.write_text("if true; then\necho missing fi\n",encoding="utf-8")
    ok = subprocess.run([bash,"-n",str(good)],capture_output=True,text=True)
    bad = subprocess.run([bash,"-n",str(broken)],capture_output=True,text=True)
    assert ok.returncode==0
    assert bad.returncode!=0
    lint = shutil.which("shellcheck")
    if lint is not None:
        print("ShellCheck available; run manually with",lint)
print("PASS Bash syntax-only validation")
~~~

## Technical explanation
A clean parse does not establish that a script is secure or correct. Bash syntax checking will not identify arbitrary destructive commands, command injection or runtime file errors; do not run untrusted scripts because they passed bash -n. ShellCheck can provide additional static lint warnings if separately installed. The example uses subprocess argument vectors and deliberately never passes shell=True.

## Bounded practice
Add a script containing a syntactically valid but unsafe `rm` command; observe that bash -n accepts it. Explain why manual review and sandboxed execution policies are still needed. Try missing quotes and broken parentheses and collect the exit codes. Check whether Bash is available in Termux or Linux, and report SKIP rather than success if it is absent.

## Diagnostics and safety
If Bash is not installed, the recipe should not report a successful parse. If ShellCheck is missing, record that lint was not performed rather than assuming it passed. A nonzero syntax-check exit code points to a grammar problem and should stop automated execution of the candidate.
