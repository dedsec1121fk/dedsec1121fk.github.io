# Study paths and glossary

## Concept

Beginner path: 00–04 and 18 for bytes, hashes and bounds. Intermediate: 05–12 for native, web, mobile and network formats. Advanced: 13–17 for comparisons, evidence and specifications.

## Without AI: practice

Define artifact as exact file, static as inspection without execution, dynamic as measured runtime, provenance as evidence origin and coverage as tested cases.

## Verify it

Submit one hash, one byte-offset map, one malformed-input test and one explicit unknown.

## With AI (optional)

AI may quiz you on counterexamples but earns no credit without your own verified observations.

## Four practical study tracks

**Native software, desktop Linux/Windows:** compile a tiny C program; verify file type and architecture; identify main in Ghidra; compare Listing, Function Graph and Decompiler; validate three boundary inputs. Deliver a graph and a table of hypotheses versus observations.

**Android packages:** build your own harmless APK; inspect manifest, signing information and permission declarations; add one permission and compare artifact hashes and declarations. Explain why a requested permission is not proof of runtime use. Full desktop APK analysis tools may not be available in Termux.

**Local HTTP service:** serve an endpoint returning JSON, use browser DevTools Network to record status, headers and body. Add a missing path and observe 404. Distinguish failed DNS/TCP connection from an HTTP response produced by the server.

**Toy binary format:** make two files with a four-byte magic, two-byte little-endian count and bounded payload. Write a parser that rejects truncation and trailing data; mutate one byte and explain the failure mode.

Choose exactly one path for a week. Every session produces one observed behavior, one alternative explanation and one reproducible test. The final one-page report must be usable by someone without access to your original notes or an AI service.
