# A dependency inventory is actionable only when tied to a build

## Capture exact versions and origin
A requirements file with loose package constraints expresses intent, not the precise environment installed today. Record resolved versions, source package URLs or registries, supported platforms and dependency licenses. For a Python project, `python -m pip freeze` provides a quick environment snapshot but may include undeclared transitives and local experiments; compare it with the application's actual lockfile and clean test install.

~~~sh
python -m pip list --format=json
python -m pip check
python -m pip freeze
sha256sum dist/package.whl 2>/dev/null || true
~~~

## Understand what a hash protects
A digest guards against a change **relative to a trusted known value**. It does not reveal whether the original dependency was malicious or licensed for your distribution. SBOM records components and relationships; it can support vulnerability queries and license review, but it is not a security certification. A build attestation links an artifact to particular workflow claims, which must still be validated and trusted.

## Mini-review exercise
Pick a harmless open-source library already in your own project. Find its upstream package name, declared license, exact installed version, transitive dependencies and where it appears in your release. Explain whether its license notice needs shipping with the binary or website. Record one scenario where the package is unnecessary so removing it reduces attack surface and maintenance.

## Release decision
Block publication if an unknown license or unreviewed binary enters a distribution, and document why any exception was approved. Never automatically substitute similarly named packages found on an arbitrary registry. Keep a dated inventory because dependency metadata and known vulnerabilities change over time.

Source: https://docs.github.com/en/actions/concepts/security/artifact-attestations
