# Practical scripts: search text, JSON and CSV validation

## Normalize Search Text

### What the implementation does
The function normalize() in 01_normalize_search.py first applies casefold, then Unicode NFD decomposition, then strips combining marks. This allows searches such as ΣΥΝΑΡΤΗΣΗ and συναρτηση to share a match key; it also removes Latin accent marks. It is intended for searching, not for canonical file names, usernames or security identifiers: distinct strings can collapse to the same normalized value.

### Run and observe
Run python 01_normalize_search.py. The assertions cover Greek capital letters, tonos, Latin decomposed accents, an empty string and an invalid None input. Expected output is search normalization checks passed. Read the source and explain why type checking occurs before calling casefold; otherwise a None value produces an obscure AttributeError.

### Independent lab
Create a list of original titles including café, cafe, προγραμματισμός and προγραμματισμοσ. Keep the originals for display while building a separate normalized search index. Ask whether users should distinguish accent marks and compare NFD with NFKC on a few compatibility characters. For languages where diacritics alter identity, removing them may produce incorrect matches.

### Limits
Python code-point string comparison is not a complete human-language collation engine. Some Unicode confusables are unrelated characters and are not made equal by NFD. Do not use normalized search keys for authentication or authorization. Working source: 01_normalize_search.py; official reference: https://docs.python.org/3/library/unicodedata.html

## Validate a JSON Configuration

### The important distinction
Parsing JSON only verifies syntax. The validate() function in 02_validate_config.py requires exactly two keys: enabled (real bool) and max_items (integer from 1 to 1000). It rejects missing and unexpected keys, making typos visible. Python bool is a subclass of int, so an isinstance(value, int) check could accidentally accept true as 1; explicit type equality avoids that trap.

### Run the built-in checks
Execute python 02_validate_config.py. The positive case accepts an enabled configuration with 12 items. Negative cases include enabled as a string, max_items as a boolean, zero, a surprise debug key, a missing key and JSON arrays. Expected output is configuration schema checks passed. The validator does not write files or connect to services.

### Add a useful lab
Build a CLI that reads a local JSON file in UTF-8 and calls validate before changing any setting. Handle file-not-found separately from JSON syntax and schema failures. Show only field names in error messages, never raw configuration values that may contain secrets. Extend the model with an explicit optional description field and update both allowed-key policy and tests.

### Advanced limitation
Python's default json.loads accepts duplicate object keys by keeping the later value. If duplicate-key rejection is part of your security or maintenance contract, implement a custom object_pairs_hook and test it; merely checking the resulting dict does not reveal duplicates. Working source: 02_validate_config.py. Reference: https://docs.python.org/3/library/json.html

## Summarize CSV with Bad Rows

### Data format and calculations
03_csv_statistics.py reads a strict name,score CSV header with csv.DictReader. It checks the name and score fields, rejects extra columns, blank values, invalid float conversions and non-finite nan/inf numbers, then calculates the mean of only valid rows using statistics.fmean. It reports rejected records using the physical line number at the end of each parsed CSV record.

### Test it
Run python 03_csv_statistics.py. The original feed Ada 10, Grace 20 and Lin invalid produces count=2, mean=15.0 and bad_lines=[4]. The tests also confirm that a quoted comma in a name is not treated as an extra column and that non-finite scores and extra cells are rejected.

### Understand the line numbering
A quoted CSV record can span several physical lines. reader.line_num therefore tracks the last physical line consumed rather than a simple sequential row count. A blank physical line is skipped by DictReader. If your format forbids blank lines or quoted newlines, add a separate schema-level rule. Parsing strictness alone does not establish all application constraints.

### Extend the exercise
Add a minimum/maximum score range, for example 0 to 100, and prove that -1 and 101 do not influence the reported average. For huge files, accept a file handle (opened with newline="") and avoid storing all valid values; choose a numeric aggregation method and discuss floating-point error. Source: 03_csv_statistics.py. Documentation: https://docs.python.org/3/library/csv.html
## Further engineering detail

CSV field parsing and spreadsheet interpretation are different trust boundaries. Validate row shape and types during import, then define an independent export policy for formula-like cell content. Quoting a comma correctly proves that the CSV structure survives; it does not prove a spreadsheet will display untrusted input as plain text.

[CSV import contracts and spreadsheet formula boundaries](#read:fieldnotes-en-40)
