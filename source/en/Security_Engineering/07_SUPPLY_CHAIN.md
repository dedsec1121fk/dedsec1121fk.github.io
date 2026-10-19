# Supply-chain trust, detection and responsible research

## 07. Git and dependency supply-chain trust

**Focus:** Git and dependency supply-chain trust.

A green build does not guarantee trustworthy inputs. Dependency names, sources, pinning, maintainers and publication channels matter. Record package version and provenance; review license and known vulnerabilities; avoid fetching moving branches as privileged build inputs when an immutable reviewed revision is available.

Git hashes protect content-addressed objects but not the policy of who may move a branch. Protected refs, appropriate reviews and signing requirements can strengthen controls. A signed commit is useful only when the signing identity and key management are trustworthy.

**Scenario:** a small documentation-only change starts a large build with powerful credentials. Restrict build triggers by paths, least-privilege workflow permissions, and explicit release intent. Skip expensive CI for noncritical prose only if other necessary checks are retained.

**Practice:** draw which actor can modify source, dependencies, workflow files, release artifacts, and signing identities. For each, propose a least-privilege boundary.

**Failure mode:** supply-chain incidents can come from trusted-looking automation, not only source code.

---

Further reading: [Hacking Guide Project — module 133](#read:hgp-en-133).

## 08. Logs, evidence and simple detection

**Focus:** Logs, evidence and simple detection.

A detector is only as good as its telemetry. A normalized event should identify an event type, time in an unambiguous zone, relevant actor, result and source. Do not log passwords, full session tokens or unnecessary personal data.

**Synthetic example:** create ten fake login events. Eight are successful; two are unsuccessful from one fictitious test account. A rule that alerts on three failures in one minute should NOT fire. Change the dataset to contain three failures; now it should. Remove timestamps and the rule must report insufficient evidence rather than inventing timing.

Keep detection and response separate. An alert is a prompt to investigate, not proof of compromise. High-impact containment should require controls and review.

**Exercise:** write expected true positives, expected false positives, missing-field behavior and a regression test. Then write a one-paragraph triage note distinguishing observation from hypothesis.

Avoid turning synthetic training examples into real operational accusations.

---

Further reading: [Hacking Guide Project — module 47](#read:hgp-en-047).

## 09. Responsible OSINT and information minimization

**Focus:** Responsible OSINT and information minimization.

Open-source intelligence can help understand systems and published technology, but “publicly visible” does not grant permission to harass, deanonymize or republish personal details. Scope research to a legitimate purpose. Separate source, timestamp, observation and inference.

For software research, useful open information includes official release notes, documentation, public advisories, published code and a project's stated security policy. Do not invent ownership or vulnerability claims from weak correlations.

**Practice:** compare two public documentation versions of an imaginary library. Record factual interface changes, old versus new command behavior and migration concerns. Explicitly mark anything that requires execution as unverified.

**Data minimization:** retain the minimum evidence needed to support a technical conclusion. Remove handles, contact data and unique artifacts before making a reusable lesson.

The goal is better decisions, not a dossier on another person.

---

Further reading: [Hacking Guide Project — module 34](#read:hgp-en-034).
