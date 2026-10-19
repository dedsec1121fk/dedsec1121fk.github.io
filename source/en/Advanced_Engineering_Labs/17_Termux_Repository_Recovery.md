# Termux: recover package metadata without destroying the environment

## Capture the actual failure first
Run `termux-info` and record the application source, Android release and enabled repository URLs. Then use `pkg update` to reproduce the failure, keeping the first HTTP status, TLS error or signature message. “Unable to locate package” is not interchangeable with “repository has no Release file”: the former can mean a misspelled package name or a missing enabled component, while the latter concerns repository metadata. Preserve the output before changing configuration.

~~~sh
termux-info
pkg update
apt-cache policy python
~~~

## Decide which branch applies
For a DNS or timeout error, verify connectivity and whether the chosen mirror resolves; do not disable TLS verification. For a stale or retired mirror, use `termux-change-repo` to choose a currently maintained repository and then refresh metadata. For a signature or repository-origin change, read the complete warning; do not automatically trust an unexpected signing key. `pkg upgrade` changes installed packages and belongs **after** you understand the repair, not at the beginning of a blind recovery.

## An easily missed Android boundary
Do not mix app builds and add-ons signed by different publishers. A Termux APK installed through one distribution channel may be incompatible with plug-ins from another; check the publisher's official guidance before migration. Back up working project files and note the `PREFIX` value before reinstalling the application. Never replace all `sources.list` entries with an unverified mirror pasted from a random chat.

## Validate and stop
Refresh once with `pkg update`, inspect one known installed package with `pkg list-installed`, and test `python --version` if Python was already present. If network access remains broken, keep the observed error and investigate the network instead of repeatedly clearing APT's databases. This lesson does not claim a repair has been run on the reader's device.

Reference: https://github.com/termux/termux-packages/wiki/Package-Management
