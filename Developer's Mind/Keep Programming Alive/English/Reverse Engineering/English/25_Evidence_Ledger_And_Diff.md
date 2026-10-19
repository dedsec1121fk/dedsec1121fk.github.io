# A good technical finding can be reproduced by someone else

## Use an evidence ledger
For each conclusion record an identifier, source hash, tool and version, inspected byte/line range, direct observation, interpretation and confidence level. Keep observation separate from hypothesis. “The binary imports a network library” is an observation; “the feature sends private data” is a behavioral inference requiring runtime evidence and permission to investigate.

~~~text
E-001 | sha256=... | tool=readelf | section=.dynsym | observed=import name
H-001 | based-on=E-001 | interpretation=possible network feature
T-001 | owner-approved test | result=not executed / observed ...
~~~

## Compare like with like
When inspecting two builds, hash both originals, record architecture and compiler configuration, and compare stable structures such as symbols, strings, manifests or schema. Timestamp changes, debug symbols and compiler optimizations can produce large binary differences without a corresponding user-visible behavior change. A source-level change is not automatically the cause of every changed byte.

## Control the experiment
Change one feature in a program you own and produce builds A and B using the same toolchain. Record one changed source line and predict what will differ. Compare strings and dynamic symbols, then describe unexpected unrelated changes rather than hiding them. Repeat the build with no source change to measure nondeterministic output.

## Ethical boundary and handoff
An authorized security review should include reproduction steps that do not expose sensitive user information, affected version, remediation suggestion and a responsible disclosure path. If you cannot show a causal link between evidence and claim, downgrade the claim to “possible” and list what additional observation is required.
