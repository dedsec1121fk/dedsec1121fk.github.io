# Termux package repository failures: distinguish mirror, DNS and stale indexes

## What causes the failure
An apt/pkg failure in Termux can indicate a mirror outage, an outdated index, incorrect repository configuration, network DNS failure or a TLS/certificate problem. Package 404 does not mean a package never existed. Termux uses repositories built for its environment: mixing arbitrary Ubuntu or Debian apt sources can break binary compatibility and package resolution.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
pkg --version
printf 'PREFIX=%s\n' "$PREFIX"
pkg update
# Inspect errors before deciding on a change.
command -v termux-change-repo
# Use termux-change-repo interactively to select a supported mirror.
# Then rerun: pkg update && pkg upgrade
~~~

## Repair in evidence-based order
Preserve the complete first failing URL, DNS error or certificate diagnostic, but redact tokens. If the failure is temporary, retry with sensible delay. If a mirror is truly down, select a supported mirror using termux-change-repo rather than editing random source URLs. Before a major upgrade note available storage and back up important files. Never disable signature or TLS verification to silence errors.

## Hands-on exercise
Compare behavior with working DNS but an intentionally nonexistent repository path on your own local HTTP fixture. Record how HTTP 404 differs from a DNS lookup failure. In a real Termux session inspect package index dates before choosing a mirror.
