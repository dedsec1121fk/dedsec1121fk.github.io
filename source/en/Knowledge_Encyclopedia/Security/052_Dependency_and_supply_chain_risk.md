# Supply-chain engineering — dependencies, integrity, code review and CI

## Dependency and supply-chain risk

### Design principle and reasoning
Code dependencies can introduce vulnerable versions, unwanted install scripts or compromised artifacts. Review pinned versions, provenance, licenses and transitive dependencies rather than assuming trusted names.

### Study a concrete case
~~~sh
python -m pip list --format=freeze
python -m pip check
# Read-only inventory, not an instruction to upgrade everything.
~~~

### Independent exercise
On a disposable project compare an exact requirement with an unconstrained one; inspect lockfile and transitive tree before changing anything.

### Evidence for review
For Dependency and supply chain risk, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Backup recovery and integrity

### Design principle and reasoning
A backup is useful only when recovery has been tested. Copies stored beside the original may share failure modes, and checksums detect changes only relative to trusted expected digests.

### Study a concrete case
~~~python
import hashlib
payload=b'backup sample'
digest=hashlib.sha256(payload).hexdigest()
assert hashlib.sha256(payload).hexdigest()==digest
~~~

### Independent exercise
Create a disposable backup, change the source, restore into a separate location and verify contents. Document RPO/RTO instead of claiming safety because a ZIP exists.

### Evidence for review
For Backup recovery and integrity, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Git history and branches

### Design principle and reasoning
A Git commit is a snapshot pointing to parent history. Branches are movable names for commits; a shallow clone retains only part of history, and a ZIP extraction is not a Git repository.

### Study a concrete case
~~~sh
git status --short --branch
git log --oneline -5
git remote -v
~~~

### Independent exercise
In a throwaway repository create two commits and a branch, inspect refs and switch without rewriting history. Recover a detached commit using a new branch.

### Evidence for review
For Git history and branches, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Code review checklist

### Design principle and reasoning
Code review evaluates intent, correctness, security, maintainability and tests. A large diff is not proof of progress; reviewers need to understand behavior changes and their rollback impact.

### Study a concrete case
~~~text
Review a parser change:
- Is input schema explicit?
- Does a failing row mutate stored data?
- Is there a regression test?
- Does the error disclose a secret?
~~~

### Independent exercise
Compare a correct parser that rejects malformed input with a version silently coercing everything to strings. Write two actionable review comments.

### Evidence for review
For Code review checklist, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Continuous integration

### Design principle and reasoning
CI automates checks on code changes, often across different operating systems and versions. A green workflow does not imply a deployable release when no tests were collected or artifacts were never inspected.

### Study a concrete case
~~~sh
python -m unittest discover -v
python -m compileall -q .
~~~

### Independent exercise
Create a local test that fails before a fix and passes after. Explain what a no-tests-found run should report to a CI system.

### Evidence for review
For Continuous integration, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Dependencies, reproducible builds and provenance

### A checksum is not proof of a trustworthy publisher
A SHA-256 digest can detect whether a downloaded file's bytes differ from an expected digest. But if the attacker controls both the archive and the digest displayed on the same compromised page, comparing them proves little about provenance. Authenticity requires an independent trustworthy channel, a verified signature or equivalent trusted metadata.

~~~python
import hashlib
from pathlib import Path

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()
~~~

The streaming implementation avoids reading the full artifact into memory. Test against known bytes and an independently computed expected digest. The method does not say anything about whether the original publisher's code contains vulnerabilities or malware.

### The dependency graph is larger than your requirements file
A direct package can bring many transitive dependencies. Record versions resolved by the package manager and verify lockfiles are used during an isolated, clean installation. Distinguish lockfiles from declarations with open version ranges. An exact version pin can still be insufficient for fully reproducible builds when tools, build flags, target platform, external services or mutable sources vary.

### Installation scripts have execution risk
Treat dependency installation as potentially executing third-party code where the ecosystem permits install hooks or build scripts. Use least-privileged build environments, read release notes and preserve the ability to reproduce a previous environment. A successful install isn't a security review.

### Scenario: unexpected package upgrade
Create a throwaway project with a pinned dependency, record the dependency tree, then change exactly one direct dependency version. Compare transitive versions and license notices. Do not mix intentional package upgrades with unrelated environment changes. Validate the application's behavior with regression tests, not just that the import succeeds.

### Acceptance evidence
Provide a lockfile diff, independent artifact hash, package-source identity, supported platform and rollback steps. Identify explicitly which trust boundary each safeguard covers and what remains unprotected. Never publish tokens or personal credentials in dependency manifests or CI logs. These examples are guidance, not a claim that packages have been installed in this audit.
