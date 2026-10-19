# SQLite — parameter binding, rollbacks and query plans

## Scenario and acceptance criteria
A local notes database holds note rows and labels referring to existing notes. The acceptance rule is that a transaction inserting a note and then an invalid label must leave no new note behind. Titles are always bound as values rather than interpolated into SQL. A deliberately malicious-looking title must be treated as text, not executable SQL.

## Executable lab — Python 3 standard library
Save the example as `07_sql.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE note(id INTEGER PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE label(id INTEGER PRIMARY KEY, note_id INTEGER NOT NULL
  REFERENCES note(id), name TEXT NOT NULL);
""")
with db:
    db.execute("INSERT INTO note VALUES (?, ?)", (1, "first"))
before = db.execute("SELECT count(*) FROM note").fetchone()[0]
try:
    with db:
        db.execute("INSERT INTO note VALUES (?, ?)", (2, "temporary"))
        db.execute("INSERT INTO label VALUES (?, ?, ?)", (8, 99, "bad"))
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT count(*) FROM note").fetchone()[0] == before
attack = "' OR 1=1 --"
assert db.execute("SELECT count(*) FROM note WHERE title=?", (attack,)).fetchone()[0] == 0
db.execute("CREATE INDEX note_title_idx ON note(title)")
plan = db.execute("EXPLAIN QUERY PLAN SELECT * FROM note WHERE title=?", ("first",)).fetchall()
assert any("note_title_idx" in row[3] for row in plan)
assert db.execute("PRAGMA foreign_keys").fetchone()[0] == 1
db.close()
print("PASS sqlite transaction and bindings")
~~~

## Technical explanation
Placeholders (?) separate query syntax from user values and prevent SQL injection at that boundary. SQLite foreign-key enforcement must be enabled for each connection and can be checked with PRAGMA foreign_keys. A transaction groups dependent writes; raising IntegrityError from the second insert causes the first insert to roll back. A secondary index may improve equality lookups at the expense of additional writes and storage; inspect EXPLAIN QUERY PLAN rather than assuming an index is always used.

## Bounded practice
Run with and without PRAGMA foreign_keys on a disposable database and record the row counts. Insert a valid label, then attempt one with an unknown note ID. Compare `?` binding to unsafe string concatenation conceptually without executing the concatenated query. Test two connections and explain what the second can see before the first commits.

## Diagnostics and completion evidence
If an invalid reference succeeds, check the foreign_keys pragma on the exact connection executing the write. If a lookup appears slow, inspect index use and row counts, not just wall-clock time on a single tiny fixture. For concurrent writes, bound busy retries and record SQLITE_BUSY rather than swallowing it.
