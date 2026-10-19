# Secure inputs, identity sessions and secret handling

## 04. Input parsing, SQL and browser output

**Focus:** Input parsing, SQL and browser output.

Treat validation and output encoding as different defenses. Validate data type, length and business rules at the trust boundary. Use parameterized queries for SQL values rather than concatenating external text into query strings. For browser output, choose textContent unless HTML rendering is explicitly required.

**Tiny SQL example (Python sqlite3):**

    row = db.execute("SELECT name FROM notes WHERE id = ?", (note_id,)).fetchone()

The placeholder separates SQL structure from a value; it does not authorize which note may be read. Authorization still belongs in policy.

**HTML example:** rendering a user's title via textContent makes angle brackets literal. Escaping once and then decoding it somewhere else may reintroduce risk; follow the complete data path.

**Practice:** write tests for empty input, very long input, non-ASCII Greek, unexpected types, and text containing quotes. Observe which layer rejects or encodes each case.

Never treat a sanitizer as a substitute for correct context-specific encoding and server-side authorization.

---

Further reading: [Hacking Guide Project — module 40](#read:hgp-en-040).

## 05. Sessions, OAuth, MFA and passkeys

**Focus:** Sessions, OAuth, MFA and passkeys.

A session cookie identifies a login session; it should not contain reusable credentials in readable form. Set appropriate Secure, HttpOnly and SameSite properties for browser contexts, rotate identifiers after sensitive transitions, and make logout invalidate server-side state where applicable.

OAuth is delegated authorization; OpenID Connect adds an identity layer. An access token has an intended audience and scope. Verify issuer, audience, expiry and signature according to the protocol and deployment; do not treat “looks like a JWT” as validation. Distinguish authentication from resource access.

MFA reduces account takeover risk but recovery flows can become the weakest path. Passkeys use public-key credentials bound to relying-party origin rather than sending a reusable password secret.

**Design exercise:** draw login, session refresh, logout and account recovery as four state transitions. For each, list who can initiate it, what evidence is required, whether a token can be replayed, and how to revoke access.

**Failure:** testing only successful login overlooks expired refresh tokens and cross-account session confusion.

---

Further reading: [Hacking Guide Project — module 39](#read:hgp-en-039).

## 06. Secrets, encryption and passwords

**Focus:** Secrets, encryption and passwords.

A hash, encryption and digital signature solve different problems. Hashing checks equality/integrity; authenticated encryption provides confidentiality plus tamper detection; signatures provide a verifiable claim tied to a signing key. Do not invent cryptographic algorithms.

Passwords should be stored with a dedicated slow password-hashing function such as Argon2id when supported by the platform, with unique salts and calibrated resource settings. General-purpose SHA-256 alone is not suitable for password storage. Store secrets in an OS keystore or managed secret store where available, not in Git or logs.

**Threat example:** an API key accidentally committed to a repository. Removing it from the latest file does not revoke the old key or erase every copy. First revoke/rotate, inspect authorized usage logs, and then perform coordinated history cleanup if necessary.

**Practice:** sketch key creation, deployment, access, rotation and destruction. Who can read each key? How can a compromised key be revoked without disabling the whole product?

Security depends on lifecycle and access boundaries, not on secret-looking strings.

---

Further reading: [Hacking Guide Project — module 49](#read:hgp-en-049).
