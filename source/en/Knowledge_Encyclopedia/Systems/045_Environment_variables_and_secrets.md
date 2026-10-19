# Environment variables and cross-platform configuration

## Environment variables and secrets

### Practical explanation
Environment variables provide configuration inherited by processes, but are not a secure secret vault. Their values can leak through logs, crash reports, subprocess environments or debugging tools.

### Worked illustration
~~~python
import os
port=int(os.environ.get('APP_PORT','8000'))
assert 0<port<65536
~~~

### Realistic exercise
Use a harmless port variable and reject invalid strings. Trace which child processes inherit it; never print real tokens during diagnostics.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Environment variables and secrets from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Cross-platform development

### Practical explanation
Portable code makes dependencies on path separators, line endings, process APIs, filesystems and permissions explicit. Running on Linux does not guarantee the same behavior on Windows or Termux.

### Worked illustration
~~~python
from pathlib import Path
p=Path('docs')/'guide.md'
assert p.name=='guide.md'
~~~

### Realistic exercise
Test a path with spaces and Greek characters on your target platforms; compare file permissions and executable availability rather than hardcoding /bin/bash.

### Review the actual contract
Describe how a caller can distinguish valid behavior for Cross platform development from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.
