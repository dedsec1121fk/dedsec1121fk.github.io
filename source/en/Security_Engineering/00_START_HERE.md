# Security Engineering — applied companion to the Hacking Guide

The existing programming library already contains foundations, debugging, code examples and security references. This track adds **16 topic-specific original lessons** connecting cybersecurity concepts to day-to-day software development. It is **not** a mirror of the 140-module Hacking Guide, and no private repository contents are reproduced.

## Reading map

- [01. Threat modeling a small offline app](01_THREAT_MODEL.md) — Guide #41
- [02. Linux and Termux permissions](01_THREAT_MODEL.md) — Guide #33
- [03. Authentication is not authorization](01_THREAT_MODEL.md) — Guide #71
- [04. Input parsing, SQL and browser output](04_WEB_INPUT.md) — Guide #40
- [05. Sessions, OAuth, MFA and passkeys](04_WEB_INPUT.md) — Guide #39
- [06. Secrets, encryption and passwords](04_WEB_INPUT.md) — Guide #49
- [07. Git and dependency supply-chain trust](07_SUPPLY_CHAIN.md) — Guide #133
- [08. Logs, evidence and simple detection](07_SUPPLY_CHAIN.md) — Guide #47
- [09. Responsible OSINT and information minimization](07_SUPPLY_CHAIN.md) — Guide #34
- [10. TCP, TLS, DNS and debugging connections](10_NETWORKING.md) — Guide #51
- [11. Secure AI and retrieval agents](10_NETWORKING.md) — Guide #25
- [12. Backups, restore and integrity](10_NETWORKING.md) — Guide #48
- [13. Malware triage without execution](13_MALWARE_TRIAGE.md) — Guide #79
- [14. Parser robustness and small fuzz tests](13_MALWARE_TRIAGE.md) — Guide #68
- [15. Android app boundaries and package updates](13_MALWARE_TRIAGE.md) — Guide #56
- [16. Ethical testing and reporting](13_MALWARE_TRIAGE.md) — Guide #43

## Study method

Pick one chapter. Draw the data flow or state transition, predict how it fails, run only the safe synthetic exercise, explain a fix, and write one negative regression test. Start with Threat Modeling and Input Parsing if you are new; continue with APIs and identity; then study logs, supply chain, AI and Android.

Source reference: [Hacking Guide](#read:hacking-authorized-lab-en) — 140 English modules and 140 Greek modules, categorized and searchable. Follow original chapters for much deeper coverage. This track is concise on purpose and avoids duplicating complete upstream material.

**Offline browsing:** the new chapters are included in the local HTML search index; no account or command is required for ordinary reading. A future editor must rebuild the HTML index after changing source lessons.
