# Termux TLS certificates and clock drift

## What is happening
A certificate verification failure can be caused by an incorrect Android clock, outdated CA certificates or an intercepting network proxy.

## Practical investigation
Inspect the target domain and certificate errors before changing trust settings. Check whether HTTPS succeeds on a different known-good network.

## Common traps
Never resolve TLS errors by permanently disabling SSL verification. Update trusted packages and verify the server name instead.

## Adaptable demonstration
```text
date && curl -Iv https://github.com
```

## Inspect narrowly and protect diagnostic output
`curl -Iv` can reveal request headers and proxy details; use a public host without credentials and sanitize the output before sharing. Begin with `date -u` and a short HEAD request with explicit connect and total time limits. A wrong clock can invalidate certificate dates even when the certificate chain is otherwise correct.

Compare the requested hostname with the certificate identity. Connecting to a bare IP is not a fair replacement for a hostname request: it changes name validation and usually TLS SNI. If an authorized inspection proxy is required, use its documented trust installation rather than accepting an unknown certificate encountered on a public network.

On Termux, package-provided CA material and Android/browser trust behavior may differ. A browser succeeding does not prove the CLI is using the same store. Record app source, Android version, curl TLS backend and whether the failure occurs before HTTP. Updating a CA package cannot fix a certificate issued for the wrong server name.
