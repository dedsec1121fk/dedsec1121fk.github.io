# SQLite schema migration — idempotency, transactions and rollback

## Scenario and invariant
An offline notes application starts with a version-one task table containing an integer key and a unique non-null title. Version two adds a completion flag restricted to zero or one. Existing databases need a safe, repeatable upgrade that does not erase notes. SQL identifiers come only from trusted source code, while user-provided values use bound parameters. A failed multi-statement update must leave the database in its previous valid state.

## Executable Python 3 migration fixture
Save as migration_lab.py and run python3 migration_lab.py. This in-memory database tests an initial migration, a repeated migration, a duplicate-title rollback and PRAGMA integrity_check.

~~~python
import sqlite3

def migrate(db):
    current = db.execute('PRAGMA user_version').fetchone()[0]
    if current > 2:
        raise ValueError('database is newer than this program')
    with db:
        if current == 0:
            db.execute('CREATE TABLE task(id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)')
            db.execute('PRAGMA user_version = 1')
            current = 1
        if current == 1:
            db.execute('ALTER TABLE task ADD COLUMN done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1))')
            db.execute('PRAGMA user_version = 2')

with sqlite3.connect(':memory:') as db:
    migrate(db)
    migrate(db)  # migration is idempotent
    assert db.execute('PRAGMA user_version').fetchone()[0] == 2
    with db:
        db.execute('INSERT INTO task(title) VALUES (?)', ('alpha',))
    before = db.execute('SELECT COUNT(*) FROM task').fetchone()[0]
    try:
        with db:
            db.execute('INSERT INTO task(title) VALUES (?)', ('temporary',))
            db.execute('INSERT INTO task(title) VALUES (?)', ('alpha',))
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError('UNIQUE failed to reject a duplicate')
    assert db.execute('SELECT COUNT(*) FROM task').fetchone()[0] == before
    assert db.execute('SELECT done FROM task').fetchall() == [(0,)]
    assert db.execute('PRAGMA integrity_check').fetchone() == ('ok',)
print('PASS SQL migration: version, idempotency, UNIQUE, rollback, integrity')
~~~

## Analyze the database behavior
The SQLite PRAGMA user_version field stores a schema version in the database file. The migration function reads the version and applies only the missing steps inside a transaction. Adding a column with NOT NULL DEFAULT 0 populates a valid default for existing rows and CHECK constrains later writes. The UNIQUE constraint protects task titles from duplicate insertion even when application code neglects validation. In the failure experiment, inserting temporary succeeds initially, but inserting alpha again raises IntegrityError, causing the entire with db transaction to roll back: the temporary row disappears. This relies on the connection transaction mode and SQLite behavior; verify it on the actual environment before deploying migrations. The sqlite3 connection context manager does not close the connection; caller ownership still matters.

## Safety boundaries, test plan and extensions
1. Start from a real disposable version-one schema with rows, migrate to two and prove both preserved titles and new default values. Rerun to demonstrate idempotency.
2. Force a migration error halfway through and inspect PRAGMA user_version plus sqlite_master. Do not advertise atomicity without testing the statements your chosen backend supports.
3. Use two connections to a file-backed database and document reader visibility before and after commit. Handle SQLITE_BUSY and rollback without disabling constraints.
4. Reject a database whose user_version is newer than the application. Back up a disposable database and actually restore it before promoting a migration to production.

**Evidence:** PASS, row counts before/after failure, schema-version transitions, integrity_check and a tested backup-restore plan. Never run this lab on personal database files.
## Further engineering detail

Protect an edit with the revision that was originally read, not only the row identifier. Treat zero affected rows as a possible stale-write conflict and preserve the current winner. A transaction provides atomic execution; an explicit revision predicate supplies the application rule that prevents one editor from silently overwriting another.

[Optimistic concurrency and lost-update prevention](#read:fieldnotes-en-39)
