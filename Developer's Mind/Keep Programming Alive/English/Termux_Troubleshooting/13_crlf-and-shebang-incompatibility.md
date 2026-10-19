# Shell CRLF and shebang errors: inspect actual bytes

## Cause and symptoms
A script downloaded or edited on Windows may use CRLF line endings; under Linux/Termux the carriage return can become part of a shebang interpreter path, producing bad interpreter errors even when the script appears visually correct. A missing shebang, unsupported interpreter path or non-executable file is a different failure. Diagnose the byte sequence before bulk rewriting source.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
# Read the first bytes of an affected script:
od -An -tx1 -N64 ./script.sh
# On a DISPOSABLE copy, normalize CRLF to LF using Python:
python -c 'from pathlib import Path; p=Path("script.sh"); p.write_bytes(p.read_bytes().replace(b"\r\n",b"\n"))'
# Verify the actual interpreter path with command -v sh.
~~~

## Evidence-based repair
Preserve a backup before normalization, especially if the file contains binary data or deliberate CRLF. Change text files only after confirming encoding and line-ending policy. Use /usr/bin/env sh on environments that provide it, or the validated Termux sh path. A successful sh script.sh test can bypass the direct shebang path and helps isolate the cause, but does not mean the direct execution problem is fixed.

## Hands-on lab
Create two otherwise identical scripts, one LF and one CRLF. Inspect their hexadecimal first line, compare sh file with ./file after chmod u+x, then normalize only the test copy and recheck.
