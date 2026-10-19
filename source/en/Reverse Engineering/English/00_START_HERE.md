# Reverse engineering fundamentals: evidence, Android and firmware

## Start with evidence

### Concept

Reverse engineering is an attempt to build a testable explanation from observable artifacts, not to magically recover original source code. Start with one question, one target and a stated limit.

### Without AI: practice

Choose your own demo binary; record its size, SHA-256 and first bytes before changing anything. Separate observed facts from hypotheses in two notebook columns.

### Verify it

Explain why a file beginning with DMR1 has not yet been proven to be a valid DMR1 file.

### With AI (optional)

Ask for two candidate explanations of a redacted observation; choose a test to rule one out.

### Investigation from a question, not from a tool
Suppose an offline converter produces a different result for a 4-byte record. Write one falsifiable question: "Does the first byte encode a version or a count?" Create two independent files differing in precisely that byte and compare output. Preserve the original file and use only copies. If changing the byte has no effect, your hypothesis has not been demonstrated; the bytes might be checksummed or ignored.

**Evidence sheet:** artifact SHA-256, origin/permission, platform, program version, input hash, observed output, hypothesis, next discriminating experiment, and confidence (confirmed / likely / unknown). A discovered string is a clue, not proof that a feature executes.

**Practice:** make an entirely fictional format with a four-byte magic value and a count. Derive three observations before reading its source, then use the source only to verify your notes.

## Android package inspection

### Concept

An APK bundles manifest declarations, resources and compiled application code. Declared permissions do not prove those capabilities were actually exercised.

### Without AI: practice

Inspect an APK you built with Python zipfile or compatible tools. Compare its AndroidManifest.xml and resource listing with your source project.

### Verify it

Identify an activity declaration and explain why its presence does not prove a screen was visited.

### With AI (optional)

AI can interpret sanitized permission names, but must not invent observed application behavior.

### Analyze your own Android APK without installing it
An APK is ZIP-based but contains structured Android resources, a manifest and compiled DEX bytecode. Begin with file hash, package identity, certificate metadata, permissions and declared entry points. Tools such as Android Studio APK Analyzer or Android SDK `apkanalyzer`/ `aapt` (when installed) let you inspect these statically. Read the manifest's exported components and required permissions; an entry declared exported is a *potential* entry, not proof of an exploit.

**Build-and-compare lab:** create an empty Android app with one Activity, build debug APK, record package name and manifest. Add one harmless permission to the manifest and rebuild; compare artifacts and declared permissions. For code changes inspect DEX method names and note how obfuscation alters them. Never install untrusted APKs on your primary phone to observe behavior.

**Limits:** JADX-style Java is reconstructed, not exact original Kotlin/Java. Certificate signature verifies APK integrity relative to the signing key, not a publisher's trustworthiness by itself. Verify work only on packages you own or may analyze.

## Firmware regions and boundaries

### Concept

Firmware can combine code, data, filesystems and compressed regions. File signatures suggest possible offsets but do not validate entire images or make extraction risk-free.

### Without AI: practice

Make a fictional file containing two length-prefixed regions. Verify offsets and non-overlap using Python slices rather than executing extracted content.

### Verify it

Corrupt a region length past end-of-file and require the parser to reject it.

### With AI (optional)

AI may propose candidate region maps; discard any hypothesis violating bounds.

### Inspect image regions without executing or flashing firmware

A firmware image may contain a bootloader, kernel, device tree, compressed filesystem, configuration and signature block. A file signature at one offset does not identify the entire blob.

Build an artificial image you own: concatenate a short ASCII header, a small ZIP containing fixture.txt, and sixteen zero bytes. Record byte count and SHA-256 before inspection.

~~~sh
file demo.img
sha256sum demo.img
xxd -l 96 demo.img
~~~

Create a map with columns start offset, end offset, proposed region, direct evidence and confidence. If you recognize ZIP bytes, verify where the ZIP starts and whether an archive viewer accepts the extracted region. Treat a declared length greater than remaining bytes as malformed rather than attempting to read past the buffer. High entropy may indicate compression, encryption or random data; it is not proof of any one.

Failure exercises: change one length byte, truncate the file, append unexpected bytes and confirm your parser reports distinct faults. Keep untouched source and test only derivative fixtures.

Do not flash uncertain images onto real devices. Automatic unpackers and viewers themselves may contain bugs; use maintained tools on isolated sample files. Success means an independently reproducible byte map, not a confident-sounding guess.

## Evidence ledger and integrity

### Concept

Claims need traceable observations. Record artifact hash, date, tool version, input, raw output, interpretation, uncertainty and next test. CRC32 is not a digital signature.

### Without AI: practice

Write claim C-01: my fixture has two records. Link it to header count, decoded records and accepted checksum.

### Verify it

Corrupt the input and identify exactly which claim loses supporting evidence.

### With AI (optional)

Give AI numbered evidence entries and reject any summary sentence without a corresponding ID.

### Evidence ledger for reproducible reverse engineering

Create a six-column observation ledger: artifact SHA-256, tool/version, exact operation, test input, direct output, and interpretation with uncertainty. Keep time in UTC and store the original artifact read-only.

**Exercise:** compile your own C fixture with -O0, record the hash and first 32 bytes using a hex viewer, then compile with -O2 and log a second entry. A different SHA-256 establishes byte differences, not their cause. Annotate a claim such as “the branch is taken when x=2” as *hypothesis* until you run that input.

Example row: fixture-debug | SHA256 … | xxd -l 32 | file header | ELF-like header bytes observed | architecture still requires confirmation. Another row should give exact compiler flags and a command for another learner to reproduce the build.

Separate evidence from opinions. Screenshots are useful navigation aids but must name the binary hash, function/offset and test conditions. Redact tokens and private paths when publishing a report; avoid executing files obtained from unknown parties.

**Completion test:** a second reader can locate the same bytes or source statement and repeat the observation without trusting your narrative.

## Manual and AI-assisted workflow

### Concept

AI is an optional collaborator, never a runtime dependency. Both paths follow question, local observation, hypothesis, falsifying test, evidence ledger and limits.

### Without AI: practice

Without AI, generate two fictional binaries, inspect their bytes, compare parser outputs and write a report on paper or in Markdown.

### Verify it

With AI, ask for alternative field layouts, then reject suggestions unsupported by the actual bytes.

### With AI (optional)

The final acceptance criteria do not change: repeatable results, clear errors, documented unknowns and local privacy.

### Compare manual analysis against AI-assisted hypotheses

**Manual path:** choose one question such as “does this parser reject an odd-length payload?”. Identify the file version, trace the relevant conditional, predict outputs for two fixture lengths, run both tests and record outcomes. Mark unread paths unknown.

**AI-assisted path:** share only sanitized small excerpts of byte tables, disassembly or pseudocode. Ask the assistant for two competing explanations plus a minimal input that distinguishes them. For example, in “if (n & 1) return 7; return 2”, predict results of n=0 and n=3. Compare that model to real output, but do not infer original variable names or claim all possible paths were visited.

Use this table in your notebook: claim | manually collected evidence | AI hypothesis | discriminating test | accepted/rejected/unknown. If the assistant invents a function or API, reject the claim until a source or experiment confirms it. AI is useful for hypotheses, not a replacement for evidence.

**Stop rules:** unclear legal authorization, unknown architecture, inaccessible executable or observations that cannot distinguish explanations. A valid conclusion can be “insufficient evidence”.

**Self-test:** describe one incorrect guess and the specific measurement that changed your interpretation.
