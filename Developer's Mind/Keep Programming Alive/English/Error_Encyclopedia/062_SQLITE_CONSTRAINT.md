# SQLITE_CONSTRAINT: identify the violated data invariant

## Exact diagnosis
SQLITE_CONSTRAINT is an umbrella result, not a sufficient diagnosis. SQLite can reject CHECK, NOT NULL, PRIMARY KEY, UNIQUE or FOREIGN KEY violations. Python typically reports sqlite3.IntegrityError; inspect sqlite_errorname on supported Python versions and the table definition. Repeating an unchanged invalid write does not repair the invariant.

## Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tickets(id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE, qty INTEGER CHECK(qty >= 0))")
db.execute("INSERT INTO tickets(code, qty) VALUES (?, ?)", ("A1", 2))
for record in (("A1", 4), ("B2", -1), (None, 1)):
    try:
        db.execute("INSERT INTO tickets(code, qty) VALUES (?, ?)", record)
    except sqlite3.IntegrityError as exc:
        print(getattr(exc, "sqlite_errorname", "integrity violation"))
    else:
        raise AssertionError("invalid row accepted")
assert db.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 1
~~~

## Resolution procedure
Read the live schema with SELECT sql FROM sqlite_schema WHERE name='tickets', then classify the constraint and the failing input. Validate before writes, but retain database constraints as the final guard against races. For multi-statement operations, use a transaction and roll back only the failed unit. Do not solve a UNIQUE conflict using INSERT OR REPLACE unless deletion-and-reinsertion semantics are intended.

## Lab and boundary conditions
Add a separate CHECK for a maximum quantity and a regression test for its boundary. Record whether an invalid write leaves earlier committed rows intact and explain the difference between application validation and database enforcement.
