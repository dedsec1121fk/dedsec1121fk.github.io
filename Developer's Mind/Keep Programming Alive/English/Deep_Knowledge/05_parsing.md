# CSV parsing — syntax, domain validation and input limits

## Scenario and acceptance criteria
A small offline importer accepts UTF-8 CSV with exactly three columns: key, label, count. The key matches an uppercase letter followed by digits, label must contain non-whitespace text, and count is an unsigned decimal integer without unnecessary leading zeros. An escaped comma inside a quoted label must not split a record; repeated keys and malformed column counts must fail before any data is published.

## Executable lab — Python 3 standard library
Save the example as `05_parsing.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
import csv, io, re
def import_records(text, limit=2048):
    if len(text.encode("utf-8")) > limit:
        raise ValueError("input too large")
    reader = csv.reader(io.StringIO(text, newline=""), strict=True)
    if next(reader, None) != ["key", "label", "count"]:
        raise ValueError("invalid header")
    output, seen = [], set()
    for row in reader:
        if len(row) != 3 or not re.fullmatch(r"[A-Z][0-9]+", row[0]):
            raise ValueError("invalid row")
        if row[0] in seen or not row[1].strip():
            raise ValueError("duplicate key or blank label")
        if not re.fullmatch(r"(?:0|[1-9][0-9]*)", row[2]):
            raise ValueError("invalid count")
        seen.add(row[0])
        output.append((row[0], row[1], int(row[2])))
    return output
assert import_records('key,label,count\nA1,"red, blue",2\n') == [("A1", "red, blue", 2)]
assert import_records("key,label,count\n") == []
for bad in ('wrong,label,count\n','key,label,count\nA1,x,-1\n',
            'key,label,count\nA1,x,1\nA1,y,2\n',
            'key,label,count\nA1,x\n'):
    try: import_records(bad)
    except ValueError: pass
    else: raise AssertionError("accepted malformed CSV")
print("PASS parsing")
~~~

## Technical explanation
The csv.reader parser understands quotes and multiline records; split(',') does not. Keep syntax parsing separate from domain checks such as uniqueness and an ID format. Limit the encoded byte length before parsing so a huge input cannot consume arbitrary memory. Even a correct CSV parser does not imply safe data for HTML, shell commands or SQL: those sinks each need their own encoding or parameter binding.

## Bounded practice
Change the label to a quoted value containing a newline and confirm it remains a single logical record. Try UTF-8 Greek labels, a duplicate key, an empty label, negative counts, leading zeros, a four-column row and a payload above 2048 bytes. For every failure record the violated boundary. Add an explicit maximum row count if the application has many short records.

## Diagnostics and completion evidence
If quoting produces unexpected columns, check that the input is valid CSV and that a file stream is opened with newline='' in Python. If the CSV is correctly parsed but a row fails, inspect the domain checks instead of loosening the parser. A valid zero count remains permitted.
