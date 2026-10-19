# Compiler and SQL error triage: names, constraints and syntax

## cannot find symbol

**Language / environment:** Java

### Meaning
A name, type or method cannot be resolved at compile time.

### Repair
Check imports, package declaration, spelling and method signature.

## UNIQUE constraint failed

### Exact diagnosis
A UNIQUE index protects business identities or other unique combinations. Duplicate writes can mean repeated requests, bad source data or a race between checking and inserting. A SELECT-before-INSERT check is not atomic; the constraint remains the authority. Treat conflict policies explicitly rather than deleting conflicting rows.

### Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE jobs(key TEXT PRIMARY KEY, attempts INTEGER NOT NULL)")
sql = """INSERT INTO jobs(key, attempts) VALUES (?, 1)
ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1"""
db.execute(sql, ("job-1",))
db.execute(sql, ("job-1",))
assert db.execute("SELECT attempts FROM jobs WHERE key='job-1'").fetchone()[0] == 2
assert db.execute("SELECT COUNT(*) FROM jobs").fetchone()[0] == 1
~~~

### Resolution procedure
Define whether the operation is create-only, a true update or a retry of the same event. ON CONFLICT targets a specific uniqueness rule; use it intentionally. INSERT OR REPLACE can delete and reinsert, affecting row IDs, triggers and foreign keys. Store idempotency keys when retries must not increase counts or charges.

### Lab and boundary conditions
Change the example so repeating job-1 does not increment attempts. Add a second unique field and test which conflict target is triggered. Verify that unrelated integrity violations still raise instead of being swallowed.

## syntax error near

### Exact diagnosis
A SQL parser error occurs before a statement can execute. The named token is where the parser became unable to continue, not necessarily where the incorrect delimiter began. Syntax depends on the engine and version: a MySQL clause may not be valid in SQLite or PostgreSQL. Treat values and SQL identifiers differently when constructing statements.

### Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE measures(value INTEGER)")
bad = "INSERT INTO measures(value,) VALUES (3)"
try:
    db.execute(bad)
except sqlite3.OperationalError as exc:
    assert "syntax" in str(exc).lower()
else:
    raise AssertionError("bad SQL parsed")
db.execute("INSERT INTO measures(value) VALUES (?)", (3,))
assert db.execute("SELECT value FROM measures").fetchone() == (3,)
~~~

### Resolution procedure
Capture the exact SQL statement with sensitive parameter values redacted. Minimize to the first failing clause while preserving engine/version context. Look for trailing commas, unmatched quotes and reserved identifiers. Parameter placeholders bind values only: choose identifiers from a validated allowlist rather than inserting untrusted column names.

### Lab and boundary conditions
Try a table name that is a reserved keyword, repair it with the quoting rules for your chosen SQL engine, and test a parameter containing an apostrophe without manual escaping. Distinguish parser errors from no-such-column errors.
