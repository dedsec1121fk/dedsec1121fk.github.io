# Threat modeling, least privilege and user consent

## Threat modeling

**Track:** Security

### Core explanation

List assets, trust boundaries, potential attackers and failure impacts before choosing controls. Focus on reachable misuse and defense of personal information instead of adding security slogans.

### Hands-on application

Model what could go wrong when a local server accepts file paths.

### Concrete trust boundary
Start by naming the assets (private files, session tokens), entry points (upload endpoint, local CLI) and trust boundaries (user input, file system). A threat scenario needs attacker capability, precondition, impact and an observable mitigation; listing 'hacking' without a flow is not actionable.

### Controlled demonstration
```python
assets={'token':'secret','readme':'public'}
assert assets['token']!='public'
# Test access control at each boundary, not by renaming a file.
```

### Verification lab
Draw a data-flow diagram for a ZIP import: uploaded bytes -> decompression -> index -> public website. Consider path traversal, oversized archives, embedded scripts and private metadata; create one safe negative test per boundary.

**Reference:** https://owasp.org/www-community/Threat_Modeling

## Least privilege

**Track:** Security

### Core explanation

Request only the permissions required for a particular operation and keep privileged tasks separate. A convenience feature does not justify broad access to private folders, camera or microphone.

### Hands-on application

Audit one feature and remove every unnecessary permission requirement.

### Concrete trust boundary
A process needs only the permissions required by its task, for no longer than needed. Reading a document does not justify repository push access, and previewing a ZIP does not require writing to the production directory. Role names alone are insufficient: check resource and action together.

### Controlled demonstration
```python
grants={'reviewer':{'read'},'publisher':{'read','publish'}}
assert 'publish' not in grants['reviewer']
assert 'publish' in grants['publisher']
```

### Verification lab
Create a permission matrix for anonymous visitor, editor and release manager, then test denied operations as well as allowed ones. Rotate any exposed credentials and never store tokens in a public repository.

**Reference:** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

## Secure defaults and user consent

Treat authorization, privacy, least privilege, and explicit user choice as design requirements. Do not place real API secrets into exercises. Never ship impersonation, credential collection, or covert microphone/camera access as beginner samples.

### Worked example

```text
import secrets
token = secrets.token_hex(16)
print("generated token length:", len(token))
```

### Practice

Explain why storing secrets inside the source repository is unsafe.

### Corrected result / hint

Repositories may be cloned or logged; use dedicated secret stores.

### Threat-model an offline file-search feature
Define the asset (lesson files), entry point (text supplied by the user), trust boundary (untrusted string becomes a path), and impact (reading outside the archive).

~~~python
from pathlib import Path
def under_root(root, relative):
    base = Path(root).resolve()
    candidate = (base / relative).resolve()
    return candidate.is_relative_to(base)
assert under_root("/tmp/lessons", "course.md")
assert not under_root("/tmp/lessons", "../secret.txt")
~~~

This checks traversal in a simple fixture but is **not** a race-proof sandbox: concurrent symlink replacement can alter paths between validation and open. For adversarial writable trees, rely on stronger OS controls. Check separate threats: token leakage in diagnostics, executable content accidentally rendered as trusted HTML, and network calls from purported offline features. For each threat specify an observable falsification test rather than a generic "be careful" instruction. Reference: https://owasp.org/www-project-application-security-verification-standard/

## DedSec legal consent declined

**Language / environment:** DedSec

### Meaning
The setup did not receive acceptance and intentionally stopped.

### Repair
Rerun bash Setup.sh; read terms via re/rg and accept if you agree.
