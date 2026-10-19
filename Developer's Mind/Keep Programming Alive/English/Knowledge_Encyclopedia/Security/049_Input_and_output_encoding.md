# Input encoding, password storage and access control

## Input and output encoding

**Track:** Security

### Core explanation

Validate untrusted data for business rules, and escape output for its destination context: HTML text, attribute, JavaScript, shell or SQL have different hazards. Do not apply a single escaping routine everywhere.

### Hands-on application

Explain why HTML escaping does not make a shell command safe.

### Concrete trust boundary
Validation and output encoding solve different problems. Validate input according to its meaning, then escape for the *destination context*: HTML text, HTML attribute, URL parameter, JavaScript string and SQL parameter each require different handling. Stripping all angle brackets can corrupt legitimate user data.

### Controlled demonstration
```python
from html import escape
value='<script>alert(1)</script>'
safe=escape(value,quote=True)
assert '&lt;script&gt;' in safe
assert '<script>' not in safe
```

### Verification lab
Render the result as HTML text content, not raw markup. For SQL use prepared parameters instead of HTML escaping, and for DOM text assign `textContent` instead of `innerHTML`. Explain why the correct encoding is output-context-specific.

**Reference:** https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

## Password hashing

**Track:** Security

### Core explanation

Passwords should be hashed using a modern slow, salted password-hashing function designed for password storage. Fast checksums such as plain SHA-256 are not suitable for password storage.

### Hands-on application

Identify what should never appear in password-related logs.

### Concrete trust boundary
Never store recoverable plaintext passwords or use a fast general-purpose SHA-256 digest alone as password storage. Use a purpose-built, salted and costed password-hashing scheme and an audited authentication framework. Verification should use a constant-time comparison of derived values and a separate rate limit on guesses.

### Controlled demonstration
```python
import os,hashlib,hmac
salt=os.urandom(16)
password=b'test-only-passphrase'
digest=hashlib.scrypt(password,salt=salt,n=2**14,r=8,p=1)
check=hashlib.scrypt(password,salt=salt,n=2**14,r=8,p=1)
assert hmac.compare_digest(digest,check)
```

### Verification lab
Test two different random salts for the same password and verify their derived values differ. Store algorithm, salt and cost parameters with the verifier, not the plaintext. Review current NIST guidance on lengths, compromised-password blocklists and avoiding arbitrary composition rules.

**Reference:** https://pages.nist.gov/800-63-4/sp800-63b.html

## Authorization versus authentication

**Track:** Security

### Core explanation

Authentication checks who is making a request; authorization checks what they may do. Every sensitive backend action must independently enforce its own permission checks.

### Hands-on application

Write an authorization test where one account cannot read another account's notes.

### Concrete trust boundary
Authentication identifies the caller; authorization decides whether that caller may act on a particular object. Logging in as user 12 does not grant access to user 13's private document. Check permissions at each object access, including read, update, delete and export; hiding a button is not authorization.

### Controlled demonstration
```python
def can_read(actor_id,document):
    return actor_id is not None and actor_id==document['owner_id']
assert can_read(12,{'owner_id':12})
assert not can_read(13,{'owner_id':12})
```

### Verification lab
Build a test matrix for owner, different authenticated user and anonymous visitor. Attempt to change the resource ID while retaining the same session, and ensure server-side authorization still rejects the request.

**Reference:** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
