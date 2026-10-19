# Authorized reverse engineering — written scope before technical work

## Scope comes before tools
A publicly reachable file, APK, package or website is not automatically an invitation to bypass authentication, intercept someone else's communications or test production endpoints. Separate (1) permission to possess a copy, (2) permission to examine or modify it, (3) permission to run active tests, and (4) permission to publish findings. The answers can differ. Legality and contracts vary by jurisdiction; if uncertain, consult the owner and relevant terms.

## Build a repeatable authorization note
For a self-created lab, write a short, explicit note **before** analysis:
- **Artifact and version:** `dmr1_lab.py`, SHA-256 digest and your ownership of its source.
- **Allowed actions:** generate two fixtures, inspect hex, deliberately mutate copies and compare parser output.
- **Excluded actions:** unrelated websites, network scans, third-party credentials, user data and any binary downloaded from an unknown source.
- **Environment:** offline Python 3, loopback only if a server is ever needed, disposable work directory.
- **Retention:** keep only harmless toy files and measurements; delete them when the lab report is finished.
- **Stop condition:** unclear provenance, unexpected personal data, external network traffic or a scope change.

For an external artifact, obtain permission matching **the actual activities and target**; do not fill out a fictional consent form on someone else's behalf. A prompt to AI is not authorization.

## Evidence chain exercise
Create two harmless fixture versions yourself. Write their source paths, SHA-256 digests, tool versions and exact changes. Produce an observation table with columns `claim | evidence | counterexample | unresolved`. Example: `count is little-endian` can be tested with sample lengths greater than 255 where permitted, not merely guessed from one short file. Keep raw bytes immutable; analyze derived copies.

## Safe alternative when permission is uncertain
Study your own compiled program, a deliberately licensed teaching sample, or your own DMR1 format. Static file inspection and active service probing are different risk classes. Avoid executing unknown binaries on a personal phone or using privileged network capture to learn about systems you do not control.

## Optional AI audit
Ask an AI to identify ambiguities in permitted actions, data handling and stop conditions. Verify any legal assertion independently; AI cannot confer authorization. **Pass condition:** another reviewer can identify what you may test, what is forbidden, why, and when you must stop without asking you to improvise the rules during execution.
