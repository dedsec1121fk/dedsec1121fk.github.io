# python — consolidated language guide

## Python

**Typical use:** General-purpose programming.

**Suggested file extension:** `.py`.

**How to run / environment:** python hello.py.

### Starter example

```python
def greet(name):
    return f"Hello, {name}!"

for person in ["Ada", "Grace"]:
    print(greet(person))
```

### How to read it

Indentation defines blocks; functions return values.

### Common pitfall

Indentation defines blocks; functions return values. 

### From beginner script to tested program
Python is strongest when you separate pure data operations from I/O. Build a tiny report that counts categories without depending on file location:
```python
from collections import Counter
def count_events(lines):
    return Counter(line.strip() for line in lines if line.strip())
assert count_events(["open\n","save\n","open\n"])=={"open":2,"save":1}
```
Next read actual lines using `Path(file).read_text(encoding="utf-8").splitlines()`, catch `FileNotFoundError` at the CLI boundary and show a helpful message. Use `python -m venv .venv` when supported, activate the environment and install only packages the program actually needs. In Termux, do not assume `python3-venv` from Debian instructions works the same way; use the packages supplied by Termux.

**Learn deeply:** iterators vs materialized lists, mutability vs copying, context managers, exceptions, type hints versus runtime validation, tests. **Practice:** stream a 10,000-row CSV, count events, reject malformed rows with line numbers, and write three `unittest` cases. Source: https://docs.python.org/3/tutorial/ and https://docs.python.org/3/library/unittest.html.

### Work through a real parser, not just print statements

Python is expressive because small functions, exceptions and standard-library tests make behavior inspectable. Write a CSV-free integer reader so that the lab has no external dependency:

~~~python
def parse_ids(text):
    result = []
    for line_number, raw in enumerate(text.splitlines(), 1):
        value = raw.strip()
        if not value or value.startswith("#"):
            continue
        try:
            number = int(value)
        except ValueError as exc:
            raise ValueError(f"line {line_number}: not an integer") from exc
        if number < 0:
            raise ValueError(f"line {line_number}: negative identifier")
        result.append(number)
    return result

assert parse_ids("4\n#note\n 7 ") == [4, 7]
~~~

Predict and test empty input, comments, whitespace, -1, a non-number, and repeated integers. Decide whether duplicates are allowed *before* changing the implementation. The first useful traceback line gives the exception type, but the failing frame in your own code locates the missing assumption.

Next refactor the function so that it yields values lazily, and explain why a generator can save memory but postpones exceptions until iteration. Compare list and generator output with unit tests; do not claim a performance improvement without measuring.

For project work, create a virtual environment with python -m venv .venv where supported, check python -m pip --version, and keep a requirements file for third-party dependencies. On Termux, confirm the Python version and available packages before assuming a desktop wheel will install.

**Passing result:** tests cover six inputs and you can explain why the invalid token raises a chained ValueError. Sources: https://docs.python.org/3/tutorial/errors.html and https://docs.python.org/3/library/venv.html.

## Python — Expanded practice workbook

### The problem and constraints
A comma can be part of a quoted field; splitting a CSV row with str.split(",") corrupts data. Use csv.DictReader to distinguish the serialized format from the validation rules. This exercise accepts a strict two-column header and normalizes status while preserving names.

### Run and predict
Save as parser.py and execute python parser.py. It needs no third-party dependencies. The expected output is parser OK. The first valid record has a comma in its name, not three columns.

~~~python
import csv
from io import StringIO
def summarize(text):
    reader = csv.DictReader(StringIO(text))
    if reader.fieldnames != ["name", "status"]:
        raise ValueError("wrong header")
    counts = {"ok": 0, "fail": 0}
    for record, row in enumerate(reader, 2):
        if None in row:
            raise ValueError(f"extra value at record {record}")
        name = (row["name"] or "").strip()
        status = (row["status"] or "").strip().lower()
        if not name or status not in counts:
            raise ValueError(f"invalid record {record}")
        counts[status] += 1
    return counts
assert summarize('name,status\n"Ada, Jr",ok\nGrace,FAIL\n') == {"ok": 1, "fail": 1}
for broken in ("name,status\n,ok\n", "name,status\nA,other\n", "name,status\nA,ok,extra\n"):
    try:
        summarize(broken)
    except ValueError:
        continue
    raise AssertionError("bad record accepted")
print("parser OK")
~~~

### Investigate the edge cases
The loop counts logical CSV records, not necessarily physical lines: a quoted field may contain a newline. To report physical lines, inspect reader.line_num. Extend the tests to cover empty input, missing status, duplicated names, Unicode names and a multiline quoted name. Decide whether repeated names are allowed before adding a uniqueness constraint.

### Extension lab
Change summarize to accept an opened file handle rather than an entire string; use open(path, encoding="utf-8", newline="") with argparse at the CLI boundary. Catch FileNotFoundError where the CLI can explain the issue; do not swallow input-validation errors. For large inputs test 100,000 rows without copying every row into another list.

### Diagnose
If import csv resolves to a local csv.py, rename that file to avoid standard-library shadowing. For UnicodeDecodeError inspect the actual file encoding rather than dropping invalid bytes. A malformed quoted CSV field may require stricter parsing with reader.strict=True; explain how the policy differs.
Success: totals 1/1 and three invalid records rejected. https://docs.python.org/3/library/csv.html

## Python — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `python3 {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Python — Focused mastery pathway

### Goal and contract
Build a small accounting importer that accepts a text stream, validates each CSV record, totals exact decimal amounts and replaces an existing JSON report only after every record is valid. The CSV header is id,amount,note. Quoted commas and newlines inside note are valid CSV; duplicate IDs, malformed quoting and invalid cent values are not. No third-party packages or network access are needed.

### Run the self-check
Save this code as csv_lab.py. Run python3 csv_lab.py (or py -3 csv_lab.py on Windows). It creates only temporary files and prints PASS if its assertions succeed. Do not run with -O, which disables assert statements.

~~~python
import csv
import io
import json
import os
import re
import tempfile
from decimal import Decimal
from pathlib import Path

IDENT = re.compile(r"[\w-]{1,24}\Z", re.UNICODE)
MONEY = re.compile(r"(?:0|[1-9][0-9]{0,5})\.[0-9]{2}\Z")

def summarize(stream):
    reader = csv.reader(stream, strict=True)
    if next(reader, None) != ["id", "amount", "note"]:
        raise ValueError("header must be id,amount,note")
    seen, total = set(), Decimal("0.00")
    for fields in reader:
        if len(fields) != 3:
            raise ValueError(f"row ending on line {reader.line_num}: expected 3 columns")
        ident, raw, note = fields
        if not IDENT.fullmatch(ident) or ident.strip() != ident:
            raise ValueError(f"line {reader.line_num}: invalid id")
        if ident in seen:
            raise ValueError(f"line {reader.line_num}: duplicate id")
        if not MONEY.fullmatch(raw):
            raise ValueError(f"line {reader.line_num}: amount needs exact cents")
        if len(note) > 80 or "\x00" in note:
            raise ValueError(f"line {reader.line_num}: invalid note")
        seen.add(ident)
        total += Decimal(raw)
    if not seen:
        raise ValueError("empty import")
    return {"rows": len(seen), "total": str(total)}

def publish(stream, target):
    summary = summarize(stream)  # No output is opened before validation succeeds.
    target, temporary = Path(target), None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="\n",
                dir=target.parent, prefix=".csv-lab-", delete=False) as out:
            temporary = Path(out.name)
            json.dump(summary, out, ensure_ascii=False, sort_keys=True)
            out.write("\n")
            out.flush()
            os.fsync(out.fileno())
        os.replace(temporary, target)  # Same-directory atomic replacement.
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return summary

def test():
    good = 'id,amount,note\nΔοκιμή-1,12.50,"quoted, comma"\nB2,0.01,"two\nlines"\n'
    with tempfile.TemporaryDirectory() as directory:
        target = Path(directory) / "report.json"
        assert publish(io.StringIO(good), target) == {"rows": 2, "total": "12.51"}
        previous = target.read_bytes()
        bad = [
            'id,amount,note\nA1,1.00,ok\nA1,2.00,duplicate\n',
            'id,amount,note\nA1,1.001,not cents\n',
            'id,amount,note\nA1,1.00,"unclosed\n',
            'id,amount,note\nA1,1.00\n',
            'id,amount,note\n',
            'id,amount,note\nA1,1000000.00,too large\n',
        ]
        for sample in bad:
            try:
                publish(io.StringIO(sample), target)
                raise AssertionError("invalid import was accepted")
            except (ValueError, csv.Error):
                assert target.read_bytes() == previous, "report was overwritten"
        assert json.loads(previous) == {"rows": 2, "total": "12.51"}
    print("PASS: quoted/multiline CSV, exact cents, six rejections, atomic report")

if __name__ == "__main__":
    test()
~~~

### Understand the design decisions
csv.reader(strict=True) understands quoted fields and reports physical line numbers. Splitting input on commas or newlines would corrupt the multiline fixture. Decimal avoids binary floating-point errors in currency, while the amount regex rejects extra decimal places instead of rounding silently. The set of seen identifiers detects duplicates; memory is proportional to distinct IDs rather than the full input, so a truly unbounded import should use disk-backed uniqueness checking.

publish validates the entire stream before opening an output file. It writes a temporary file beside the destination and uses os.replace for an atomic same-filesystem replacement. Invalid input cannot overwrite the previous report. This is not a universal power-loss durability guarantee: fsync of the directory and transactional storage may be required for stronger promises. An unwritable or missing parent directory should produce a real OS error, not a silently redirected output.

### Fault investigation
1. Swap the header columns to amount,id,note. Identify which precondition rejects the file before processing records.
2. Duplicate the Unicode identifier Δοκιμή-1, then try 1.001 as an amount. Check that the old report bytes remain identical.
3. Add a note with an embedded newline. Compare csv.reader.line_num with the number of logical CSV records.
4. Feed 100,000 synthetic records from a generator-backed stream. Measure memory and explain the cost of the seen-ID set.
5. Test a nonexistent output directory and a read-only directory. Separate input errors from filesystem errors.

### Next lab and evidence
Extract summarize and publish into a library module and add argparse for explicit input/output paths. Test an empty input, UTF-8 BOM, duplicate identifier, unfinished quote, 999999.99 and an over-limit amount. Decide whether to support BOM before implementing it. Submit the actual test outputs and explain why os.replace does not replace a database transaction when multiple files or tables must change together.

## Python — Technical notes and common pitfalls

### Core knowledge

1. Indentation forms blocks; container mutation through shared references can affect callers.
2. Exceptions carry a traceback; use context managers for file or lock cleanup.
3. Generators yield values incrementally; async functions manage cooperative IO, not CPU parallelism automatically.

## Visual Basic .NET

### Operational idea
VB.NET is a .NET language using its own syntax for classes, modules and event handling.

### Source or deliberately marked concept
```text
Module Program
  Sub Main()
    Console.WriteLine(2 + 3)
  End Sub
End Module
```

### Apply it to one controlled task
Trace the module entry point and compare Option Strict On with implicit narrowing conversions.

### Check the important boundary
VB.NET is not the same environment as VBA or legacy VBScript; distinguish .NET assemblies from Office macros.

Work with disposable data in a genuine implementation of Visual_Basic_NET where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Visual_Basic_NET — Focused mastery pathway

### Language model and syntax
Enable Option Strict On in a VB.NET console project, and parse a bounded numeric input using Integer.TryParse.

### Intermediate exercise and counterexample
Use Select Case over a small status enum. Check every case, including Unknown, and compare nullable values to default integers without implicit conversion.

### Independent project and verification
Create a read-only CSV report with explicit Using blocks around streams. Test missing files, wrong encoding and empty records; log exceptions at the CLI boundary and pin the .NET target framework.

## One shared practice method for every language

Study the language's **actual reference sample** and its declared host before attempting exercises. Predict behavior, change one small detail, test a safe invalid input, record the actual result and exact toolchain. Because programming languages include compiled code, SQL, hardware descriptions and proofs, there is no universal execute command.

### Six pieces of evidence

1. Language implementation, version and necessary dependencies.
2. Minimal accepted program, query or model.
3. Predicted effect before execution.
4. Recorded result, or a clear “not tested”.
5. At least one meaningful edge case.
6. Why a change did or did not behave as expected.

Language-specific exercises belong beside their original lessons; generic instructions live only here to avoid repeating the same text in hundreds of documents.

## <Language name>

### Purpose
Where this language is commonly used.

### Tooling
Compiler/interpreter and version to verify.

### Basic syntax
One simple, version-pinned, verified program and output.

### Worked lesson
Explain input, variables, branching, repetition and output where applicable.

### Exercise and corrected answer
A task the reader can attempt and a checked answer.

### Common errors and compatibility
Runtime version, data types and platform limitations.

### References
Official documentation homepage and a dated review note.
## Subprocess boundaries: arguments, exit status and deadlines

Passing a command as an argument list preserves the boundary between the executable and each argument. An argument containing spaces remains one value; it is not a second command. Shell interpretation is a separate feature and should be enabled only when the shell grammar is actually required. Do not build a shell string from an uploaded filename or user message.

A child process has at least three outcomes to model: successful exit, nonzero exit and timeout. A successful launch is not a successful operation. Capture only bounded output in a real service; capture_output retains everything in memory. The fixture starts the same Python interpreter and passes a deliberately awkward filename as inert data.

```python
import subprocess, sys
name = "report; this is data.txt"
run = subprocess.run([sys.executable, "-c", "import sys; print(sys.argv[1])", name],
                     text=True, capture_output=True, timeout=2, check=True)
assert run.stdout.strip() == name
failed = subprocess.run([sys.executable, "-c", "raise SystemExit(7)"], timeout=2)
assert failed.returncode == 7
print("argument and exit boundaries verified")
```

Add a child that sleeps beyond its deadline and assert TimeoutExpired. When a process starts descendants, specify how the entire process group is cancelled; stopping one parent is not a general process-tree cleanup guarantee. Never log a full argument list if it can contain credentials.

[Technical reference](https://docs.python.org/3/library/subprocess.html)
