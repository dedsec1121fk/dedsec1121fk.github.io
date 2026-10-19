# Subresource integrity and release pinning

## Mechanism and contract

An integrity hash ties a script or stylesheet reference to expected bytes. If a CDN returns different bytes, the browser can refuse the resource instead of executing it. This protects one resource fetch; it does not audit the resource's behavior, secure the entire dependency graph or authenticate a compromised page that can replace its own integrity attribute.

A release update must change both the versioned URL and its expected hash as one reviewed change. Hash the exact published bytes, not a prettified local source file. Cross-origin integrity checks also depend on the resource's CORS behavior. For an offline learning site, self-hosting a reviewed dependency can reduce third-party availability and privacy dependencies, while integrity provides an additional check where external resources remain.

## Worked local example

```python
import base64, hashlib
fixture = b"console.log('reviewed fixture');\n"
integrity = "sha384-" + base64.b64encode(hashlib.sha384(fixture).digest()).decode("ascii")
changed = fixture + b"// changed\n"
assert hashlib.sha384(fixture).digest() != hashlib.sha384(changed).digest()
print(integrity)
# Put the printed value in integrity="..." only for these exact fixture bytes.
```

## Failure checks and limits

Create a local browser fixture with a matching hash, then change one byte and observe a blocked resource and console error. Test the actual crossorigin configuration as well as the hash. Keep a rollback pair of URL and digest. A checksum that is generated automatically from an unreviewed download during every build does not establish that the downloaded release was approved.

## Primary reference

[Official documentation](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity)
