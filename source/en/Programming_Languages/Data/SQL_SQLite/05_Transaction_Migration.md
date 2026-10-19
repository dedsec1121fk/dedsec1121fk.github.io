# A schema migration needs invariants, not only successful SQL syntax

## Start in a disposable in-memory database
Create a table with a nonnegative quantity constraint and apply the schema under explicit transaction control. Testing in `:memory:` isolates the example from production files. A failed constraint should not leave half of the intended operation applied; verify the record count and previous schema state.

~~~python
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE stock (sku TEXT PRIMARY KEY, quantity INTEGER NOT NULL CHECK(quantity>=0))')
con.execute('INSERT INTO stock VALUES (?, ?)', ('A1', 3))
con.commit()
try:
    con.execute('BEGIN')
    con.execute('UPDATE stock SET quantity=? WHERE sku=?', (-2, 'A1'))
    con.commit()
except sqlite3.IntegrityError:
    con.rollback()
assert con.execute('SELECT quantity FROM stock').fetchone()[0] == 3
~~~

## Diagnose why it failed
The CHECK constraint rejects negative quantity. The UPDATE belongs to a transaction and must be rolled back after the exception; otherwise the connection may remain in an unintended transactional state. Another environment may use autocommit settings differently, so explicitly log the database driver and transaction configuration.

## Migration plan for a real file
Make a verified backup of the database, inspect `PRAGMA user_version`, design the forward migration, and test it against a representative copy. If the migration adds a NOT NULL column, decide how legacy rows receive values. Never assume an ALTER TABLE statement can simply reverse every migration without data loss.

## Acceptance criteria
Test both a valid and invalid mutation, verify the rollback invariant, and check the final schema with `PRAGMA table_info(stock)`. Use parameter placeholders instead of concatenating SQL from user input. The example is about local transactional behavior, not performance on a remote database server.

## Make the schema change itself transactional
The first example tests a row constraint, not a schema migration. This independent in-memory experiment proves that a failed DDL migration can restore the previous schema. It uses explicit SQL transaction statements with `isolation_level=None`, avoiding dependence on Python's changing implicit transaction defaults.
~~~python
import sqlite3
con = sqlite3.connect(':memory:', isolation_level=None)
con.execute('CREATE TABLE notes (body TEXT NOT NULL)')
con.execute('INSERT INTO notes VALUES (?)', ('keep me',))
con.execute('BEGIN IMMEDIATE')
try:
    con.execute('ALTER TABLE notes ADD COLUMN flag INTEGER NOT NULL DEFAULT 0')
    con.execute('PRAGMA user_version=1')
    raise RuntimeError('simulated migration interruption')
except RuntimeError:
    con.execute('ROLLBACK')
assert [r[1] for r in con.execute('PRAGMA table_info(notes)')] == ['body']
assert con.execute('PRAGMA user_version').fetchone()[0] == 0
assert con.execute('SELECT body FROM notes').fetchone()[0] == 'keep me'
con.close()
~~~
Repeat without the simulated interruption and replace the rollback path with COMMIT. The added column and schema version should then appear together. A transaction does not replace a verified backup of a real database. Also check driver-specific operations such as executescript, which can interact with transaction boundaries differently from individual execute calls.

Another connection may already hold the write transaction, so BEGIN IMMEDIATE can fail before any migration statement executes. Handle that busy result separately from invalid migration SQL, and avoid blindly retrying schema changes after an uncertain partial outcome.

References: [SQLite transactions](https://www.sqlite.org/lang_transaction.html) and [Python sqlite3](https://docs.python.org/3/library/sqlite3.html).
## Savepoints and partial rollback inside a transaction

A savepoint marks a rollback boundary inside a larger transaction. Rolling back to it undoes later changes while keeping earlier work and the outer transaction alive. Releasing a savepoint is not the same as independently committing its changes to durable storage; an outer rollback can still undo them.

Use this when one optional batch item may fail but the surrounding operation has an explicit partial-success contract. If the business rule requires all items to succeed together, partial recovery would violate that rule even though the SQL is valid.

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(":memory:")) as db:
    db.execute("CREATE TABLE items(id INTEGER PRIMARY KEY)")
    db.execute("BEGIN")
    db.execute("INSERT INTO items VALUES (1)")
    db.execute("SAVEPOINT optional_item")
    db.execute("INSERT INTO items VALUES (2)")
    db.execute("ROLLBACK TO optional_item")
    db.execute("RELEASE optional_item")
    db.commit()
    assert db.execute("SELECT id FROM items").fetchall() == [(1,)]
print("outer work preserved")
```

Add a final outer rollback and prove that even previously released inner work disappears. Keep savepoint names controlled by the program, not interpolated from an external item label. Log which items were accepted without reporting a partially successful batch as an unconditional success.

[Technical reference](https://www.sqlite.org/lang_savepoint.html)
