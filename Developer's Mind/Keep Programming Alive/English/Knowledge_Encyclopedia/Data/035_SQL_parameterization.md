# SQL parameters — distinguish query structure from values

## Problem
A user searches local notes by title. The program must interpret the supplied title as literal data, not as part of SQL syntax. Even a harmless title containing an apostrophe can break a string-concatenated statement; deliberately crafted text may change a predicate. Prepared parameter placeholders keep the query structure fixed while supplying values separately. This example compares the unsafe technique with the safe technique *only in a disposable in-memory SQLite database*.

## Executable Python 3 demonstration
Save as sqlite_parameters_lab.py and run python3 sqlite_parameters_lab.py. The malicious-looking string is synthetic and the demonstration only performs SELECT queries over two test notes.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
db.executemany("INSERT INTO notes(title) VALUES (?)",
               [("alpha",), ("beta",)])
probe = "alpha' OR 1=1 --"
count = db.execute(
    "SELECT COUNT(*) FROM notes WHERE title = ?", (probe,)
).fetchone()[0]
assert count == 0
# Demonstration ONLY: never compose application SQL like this.
insecure_sql = "SELECT COUNT(*) FROM notes WHERE title = '" + probe + "'"
assert db.execute(insecure_sql).fetchone()[0] == 2
assert db.execute(
    "SELECT title FROM notes WHERE title = ?", ("alpha",)
).fetchone()[0] == "alpha"
print("PASS: literal parameter vs vulnerable concatenation")
~~~

## Correct reasoning
The bound placeholder SELECT ... WHERE title = ? treats the entire probe as a title and returns zero matches. Unsafe concatenation inserts the same text into the SQL grammar, changing the WHERE condition and returning both rows. Parameterization also handles Unicode and apostrophes without manual quote escaping. Placeholders cannot stand in for identifiers such as table names or ORDER BY column syntax: those must be chosen from a strict allowlist. Always apply access controls to the resulting query independently; safe parameters do not automatically authorize users to read every row.

## Bounded verification tasks
1. Search for an ordinary title and a Greek title containing an apostrophe. Confirm that binding treats them as values.
2. Replace the placeholder with direct string concatenation in the disposable fixture only, observe altered results, then restore the secure call.
3. Attempt to parameterize a table name. Explain why SQL parsers treat identifiers and values differently, and implement an allowlisted selector for one of two known columns.
4. Show that a parameterized UPDATE still needs a WHERE clause and permissions: injection prevention is not a substitute for domain authorization.

**Evidence:** PASS, query results from safe versus unsafe construction, allowed-identifier policy and a statement of authorization boundaries.
