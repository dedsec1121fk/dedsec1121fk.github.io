# GitHub Actions tokens and minimum permissions

## What is happening
A workflow runs with permissions that depend on the event and repository settings. Use contents:read for tests and contents:write only for a job that actually commits files.

## Practical investigation
Pin trusted actions to reviewed immutable commit SHAs, avoid printing secrets and review scripts sourced from pull requests before using credentials.

## Common traps
For scheduled jobs, consider concurrency, runtime limits and idempotency. Commit only changed generated data, never rebuild the entire website needlessly.

## Adaptable demonstration
```text
permissions:
  contents: read
```

## Follow the trust of the event and checked-out code
~~~yaml
permissions:
  contents: read
jobs:
  checks:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: printf '%s\n' 'No write token needed for this check'
~~~
This illustrative job does not check out or run repository code. A real test job needs its checkout and dependencies reviewed too. Pin an action to a reviewed immutable commit SHA when supply-chain policy requires it; a version tag can move. A contents permission does not independently grant Pages deployment or OIDC capability.

Do not combine an elevated pull_request_target context with checkout and execution of an untrusted contribution. The event name and checkout revision together determine the trust boundary. A masked secret is not protection against every way untrusted code can exfiltrate it. Keep writing/deployment permissions in the job that needs them and keep untrusted tests read-only.

Reference: [GitHub event trust guidance](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target).
