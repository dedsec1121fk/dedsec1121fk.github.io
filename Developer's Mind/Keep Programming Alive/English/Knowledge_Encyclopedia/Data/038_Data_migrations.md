# Database migrations — version checks and repeatable upgrades

## Schema contract
An offline app has a tasks table with ID and title in schema version 1. Version 2 adds a done field that must be 0 or 1, defaulting to 0 for existing records. The migration must preserve old data, advance the schema version only after successful changes, and be safe to call again. Unknown schema versions must be rejected rather than silently treated as the latest layout.

## Executable Python/SQLite migration
Save as migration_lab.py and run python3 migration_lab.py. The database is in memory. PRAGMA user_version records the schema version; explicit BEGIN, commit and rollback keep DDL plus version changes in one SQLite transaction.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT NOT NULL)")
db.execute("INSERT INTO tasks(title) VALUES ('one')")
db.commit()
db.execute("PRAGMA user_version=1")

def migrate():
    version = db.execute("PRAGMA user_version").fetchone()[0]
    if version == 2:
        return
    if version != 1:
        raise ValueError("unknown schema version")
    db.execute("BEGIN")
    try:
        db.execute("""ALTER TABLE tasks ADD COLUMN done INTEGER
                      NOT NULL DEFAULT 0 CHECK(done IN (0,1))""")
        db.execute("PRAGMA user_version=2")
        db.commit()
    except Exception:
        db.rollback()
        raise

migrate()
migrate()
assert db.execute("PRAGMA user_version").fetchone()[0] == 2
assert db.execute("SELECT done FROM tasks").fetchone()[0] == 0
print("PASS: versioned and repeatable migration")
~~~

## Safety boundaries
A second call sees version 2 and returns without trying to add the column again. Existing records acquire done=0 because of the NOT NULL DEFAULT clause. Updating the version marker outside the migration transaction would be dangerous: a crash could leave metadata claiming version 2 while the column was never created. SQLite permits transactional schema changes for this example; do not assume every database engine supports identical DDL transaction behavior. For a real release, back up the file, test forward upgrade from every supported version and provide explicit failure recovery.

## Bounded exercises
1. Remove the version check and run the migration twice. Capture the duplicate-column failure, then restore idempotence.
2. Set user_version to 99 and verify that the migration refuses to guess an upgrade path.
3. Introduce an invalid SQL statement before the version update and ensure rollback preserves the original schema and version.
4. Add a version 3 migration with a separate function, run 1→2→3 on a disposable file database and reopen it to validate persistence.

**Evidence:** PASS, schema descriptions before and after, an explicit unknown-version rejection, and a documented backup and recovery process.
