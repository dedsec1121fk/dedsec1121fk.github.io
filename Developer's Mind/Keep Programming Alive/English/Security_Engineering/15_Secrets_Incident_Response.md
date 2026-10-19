# Removing a token from the latest commit is not enough

## Establish whether a credential was exposed
If a token, password or private key was committed or embedded in an uploaded ZIP, treat it as potentially compromised until you can show otherwise. Record the affected repository, revision range, credential type and current permissions without copying the secret into logs or bug reports. First identify its issuing provider and owners so a revocation does not unexpectedly break unrelated production services.

~~~sh
git status --short
git log --oneline -8
# Review filenames and changes, not actual secret values:
git log --name-status --oneline -8
~~~

## Rotate before attempting history surgery
Revoke or rotate the credential through the actual provider, then update every service that depended on it through a secure configuration channel. Removing a line from Git does not invalidate an already copied key. History rewriting can reduce accidental discovery but requires collaborator coordination, backup analysis and careful force-push planning; it must never replace revocation.

## Evaluate scope with evidence
Determine whether the exposed credential had read-only or administrative privileges, whether it reached public artifacts and whether the provider can supply relevant access audit logs. Separate confirmed use from possible use: absence of visible events in a limited log is not proof nobody accessed a public token. Do not publish any realistic secret as an educational example.

## Prevent the next incident
Add structured secret scanning, `.gitignore` for local `.env` files, least-privilege short-lived credentials and a release manifest that rejects sensitive patterns. Verify the rotated service works, then document the incident without secret contents or personal identifiers.
## Rotation evidence must include consumers and revocation

Creating a replacement secret is only one step of rotation. Identify consumers, distribute the replacement through an approved channel, confirm that required services use it and revoke the exposed value. A long overlap window can leave the incident open even while the new value is working.

History cleanup reduces accidental future discovery but cannot retract copies already fetched by others. Do not use deletion of a source line as evidence that a credential is safe. Keep incident notes focused on secret identifiers and timestamps, never the secret values themselves.

```python
incident={"replacement_created":True,"consumers_verified":False,
          "old_revoked":False,"scope_reviewed":True}
def rotation_complete(row):
    return all(row[k] for k in ("replacement_created","consumers_verified","old_revoked","scope_reviewed"))
assert not rotation_complete(incident)
incident.update(consumers_verified=True,old_revoked=True)
assert rotation_complete(incident)
print("completion requires revocation evidence")
```

The Boolean model is a checklist fixture, not a credential-management service. Test the old credential against the documented provider verification mechanism without printing it. If exposure scope is uncertain, record that uncertainty and continue the investigation rather than inventing a clean bill of health.

[Technical reference](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
