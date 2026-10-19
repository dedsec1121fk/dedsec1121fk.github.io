# Software delivery — versioning, configuration, rollbacks and release checks

## Semantic versioning and compatibility

### Design principle and reasoning
Semantic versioning uses major.minor.patch according to a declared public API. A breaking signature change merits a major version under SemVer; adding a backwards-compatible behavior can be minor.

### Study a concrete case
~~~text
1.4.2 -> 1.4.3  bug fix
1.4.3 -> 1.5.0  compatible feature
1.5.0 -> 2.0.0  breaking public API
~~~

### Independent exercise
Classify a removed parameter, new optional flag and security bug fix. Discuss why pre-1.0 packages need explicitly documented stability guarantees.

### Evidence for review
For Semantic versioning and compatibility, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Documentation that stays accurate

### Design principle and reasoning
Documentation becomes stale when commands and files change without updating examples. Runnable snippets, explicit platform prerequisites and ownership for maintenance make it testable.

### Study a concrete case
~~~text
For every changed CLI flag:
1. update help output
2. update the usage example
3. run the example in a scratch workspace
4. check EN/EL parity
~~~

### Independent exercise
Break one command in a duplicated README example, then repair the single canonical source and verify linked language versions.

### Evidence for review
For Documentation that stays accurate, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Feature flags and rollback

### Design principle and reasoning
A feature flag selects behavior without requiring immediate code rollback, but flag states themselves need tests and cleanup. A database schema change might not be reversible merely by disabling UI.

### Study a concrete case
~~~python
def total(items, enhanced=False):
    if enhanced:return sum(x for x in items if x>=0)
    return sum(items)
assert total([3,-1],True)==3
~~~

### Independent exercise
Test both flag states and a transition while requests are in flight. Decide what happens to data written by the new path if the flag turns off.

### Evidence for review
For Feature flags and rollback, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Modular architecture

### Design principle and reasoning
Modules should have cohesive responsibilities and explicit dependencies. Circular imports and shared mutable globals make isolation difficult, while an interface boundary supports independent testing.

### Study a concrete case
~~~python
def parse(raw): return int(raw)
def present(number): return f'count={number}'
assert present(parse('4'))=='count=4'
~~~

### Independent exercise
Move parse and present into separate modules and make a CLI call them. Confirm importing either module performs no file writes.

### Evidence for review
For Modular architecture, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Configuration layering

### Design principle and reasoning
Configurations combine defaults, environment and explicit overrides with precedence rules. Without deterministic precedence, a production flag can silently be overwritten by a stale local value.

### Study a concrete case
~~~python
defaults={'port':8000,'debug':False}
override={'port':9000}
settings={**defaults,**override}
assert settings['port']==9000
~~~

### Independent exercise
Add a third layer, document precedence and reject unknown keys. Compare explicitly absent values with empty strings in environment variables.

### Evidence for review
For Configuration layering, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Release and artifact verification

### Design principle and reasoning
Build verification links an artifact to a known commit, toolchain and independently trusted digest or signature. Hashing a file against a digest delivered by the same attacker-controlled source is not authentic provenance.

### Study a concrete case
~~~sh
git rev-parse HEAD
sha256sum path/to/release.zip
# Compare against independently trusted release metadata.
~~~

### Independent exercise
Create a synthetic binary, record its hash, modify one byte and check the mismatch. Document why an authentic signer matters beyond checksum equality.

### Evidence for review
For Release and artifact verification, identify one failure mode beyond the happy path and specify a test or observation that would expose it. Write the expected result first, then validate the exact boundary without altering a production environment.

## Release checklist and documentation

Before releasing: read the diff, check tests, perform a real install on target platforms, preserve legal and credits, verify the archive, and publish accurate limitations. A green CI status cannot replace device testing.

### Worked example

```text
python -m compileall -q Scripts tests
python -m pytest -q tests
git diff --check
```

### Practice

Name three checks that require a physical Termux device.

### Corrected result / hint

Android permissions, first-run setup, interactive menu behavior.
