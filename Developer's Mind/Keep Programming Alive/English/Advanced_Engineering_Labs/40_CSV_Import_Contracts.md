# CSV import contracts and spreadsheet formula boundaries

## Mechanism and contract

CSV defines rows and fields, not a complete data schema. A quoted comma is part of one field; splitting a line on commas loses that structure. Decide the delimiter, encoding, newline handling, header order, maximum field size and required types before import. Preserve identifiers such as 0012 as text unless the schema explicitly says otherwise.

Spreadsheet software may interpret a cell beginning with a formula marker as executable spreadsheet syntax. That is a different boundary from parsing CSV on a server. For untrusted exports, choose a documented text-only spreadsheet format or a target-specific escaping policy and verify behavior in the actual spreadsheet client. Merely quoting a CSV field does not universally stop formula interpretation.

## Worked local example

```python
import csv, io
text = 'id,name\r\n0012,"Alice, Example"\r\n' 
rows = list(csv.DictReader(io.StringIO(text, newline="")))
assert rows == [{"id":"0012", "name":"Alice, Example"}]
def validate(row):
    return set(row) == {"id", "name"} and row["id"].isascii() and row["id"].isdigit()
assert validate(rows[0])
assert not validate({"id":"bad", "name":"fixture"})
print("CSV schema respected")
```

## Failure checks and limits

Add fixtures for embedded newlines, missing columns, extra columns and invalid byte sequences. Reject or quarantine malformed rows with their row numbers, without logging personal fields. This parser example is not a spreadsheet-export sanitizer. If exporting formulas is a legitimate feature, isolate trusted formula generation from user-supplied text and test both paths.

## Primary reference

[Official documentation](https://docs.python.org/3/library/csv.html)
