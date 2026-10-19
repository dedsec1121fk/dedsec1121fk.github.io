# “Permission denied” is not the same as “Connection refused”

## Determine where the connection stopped
If the SSH client cannot resolve the host, start with DNS or hostname spelling. If TCP connection is refused, check the server address and listening port. If the host key is unexpectedly changed, stop and verify the server fingerprint through a trusted independent channel; don't automatically remove your known_hosts entry. An authentication denial occurs later, after connecting to the host, and requires credential or server-policy investigation.

~~~sh
ssh -V
ssh -o ConnectTimeout=6 -v user@example.org
# Inspect effective client settings without connecting:
ssh -G example.org | head -35
~~~

## Keep verbose logs private
Verbose SSH traces may reveal usernames, local key file paths and internal network names. Share sanitized excerpts rather than complete private configuration. Prefer SSH keys with passphrases and controlled permissions, but do not blindly `chmod` your entire home directory. On a server you administer, inspect the service's actual authentication settings and logs before changing them.

## Build a safe local comparison
Use a lab SSH service you control, testing a correct port and a deliberately closed port. The expected failure for a closed TCP port is different from rejection of a valid connection using an unknown username or key. Do not brute-force accounts or probe unfamiliar hosts. If testing key rotations, independently verify the new fingerprint before accepting it.

## Completion standard
Write a four-stage decision tree: DNS → TCP → host identity → user authentication. Record which step succeeded, the exact error and one authorized follow-up action. Never recommend skipping host-key validation as a permanent workaround.
## Host identity changes need an independent trust path

A changed SSH host key can mean a legitimate rebuild, a changed address or an interception attempt. Removing the known-host entry suppresses the warning without resolving the identity question. Obtain the new fingerprint through an independently trusted administrative channel, compare it and record why the change was expected.

An authentication failure happens after a different boundary from host verification. Replacing a user key does not prove the server's identity. Keep a small incident record with the hostname, expected fingerprint source and verified change reason, but do not paste private keys into that record.

```python
def accept_change(expected, observed, independent_confirmation):
    return expected == observed and independent_confirmation
assert not accept_change("SHA256:fixtureA","SHA256:fixtureB",True)
assert not accept_change("SHA256:fixtureA","SHA256:fixtureA",False)
assert accept_change("SHA256:fixtureA","SHA256:fixtureA",True)
print("trust evidence required")
```

The strings are fictional identifiers, not real cryptographic fingerprints. The model illustrates the decision gate and does not replace SSH verification. For a shared host, identify who owns rotation and how all clients receive the authenticated update before the maintenance window.

[Technical reference](https://man.openbsd.org/ssh.1)
