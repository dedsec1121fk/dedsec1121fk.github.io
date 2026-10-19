# Environment variable — explicit process configuration, not secret storage

## Precise meaning
An environment variable is a named string in the process environment. Child processes normally inherit a copy of the parent's environment at launch, unless the launcher supplies a different one. It is useful for application mode, executable search paths and nonsecret configuration. It is **not** a secure password vault: diagnostic tools, logs, debug reports, other permitted processes or accidentally printed subprocess commands can reveal secrets stored there.

## Deterministic Python 3 lab
Save as environment_lab.py and run python3 environment_lab.py. This test passes a dedicated environment mapping to subprocess rather than mutating global configuration. It proves the child sees a selected mode, missing configuration has a deliberate default, invalid modes fail and child changes do not flow back into the parent.

~~~python
import os
import subprocess
import sys

KEY = 'DEDSEC_DEMO_MODE'
ALLOWED = {'development', 'test', 'production'}

def read_mode(environment):
    value = environment.get(KEY, 'development')
    if value not in ALLOWED:
        raise ValueError('unexpected mode')
    return value

def run_child(value):
    env = dict(os.environ)
    env.pop(KEY, None)
    if value is not None:
        env[KEY] = value
    command = [sys.executable, '-c',
               'import os; print(os.environ.get("DEDSEC_DEMO_MODE", "unset"))']
    return subprocess.check_output(command, env=env, text=True).strip()

assert read_mode({}) == 'development'
assert read_mode({KEY: 'test'}) == 'test'
try:
    read_mode({KEY: 'unknown'})
except ValueError:
    pass
else:
    raise AssertionError('unknown mode was accepted')
assert run_child('test') == 'test'
assert run_child(None) == 'unset'
original = os.environ.get(KEY)
command = [sys.executable, '-c',
           'import os; os.environ["DEDSEC_DEMO_MODE"]="child"; print(os.environ["DEDSEC_DEMO_MODE"])']
assert subprocess.check_output(command, text=True).strip() == 'child'
assert os.environ.get(KEY) == original
print('PASS environment: injection, defaults, validation, parent isolation')
~~~

## Understand the lifetime and trust boundary
The subprocess env argument controls what the newly launched process receives. Altering os.environ in the Python parent affects later children it launches but not a shell that launched Python earlier. Modifying the environment inside a child does not rewrite its parent environment. APP_MODE-style flags must be validated just like file inputs: accepting arbitrary modes can enable unsafe debugging, silent feature switches or surprising output. If a key holds confidential credentials, use an appropriate secrets provider or a protected credential mechanism and never log its value. This example uses only a fake nonsecret mode value.

## Experiments and diagnostics
1. Launch the script with its demo mode absent and set to test. Show the difference between a child's supplied environment mapping and the inherited parent mapping.
2. Print a stable allowlisted diagnostic such as whether a key is present, never its sensitive value. Explain what a crash report could expose.
3. Try unsupported mode staging. Confirm failure occurs before starting work and that user-provided mode text is not trusted automatically.
4. Compare behavior on Linux/Termux and Windows, including process launch conventions and platform-specific case handling of environment names.

**Evidence:** PASS, a parent/child state table, one invalid-mode failure and a stated policy for protecting credentials.
