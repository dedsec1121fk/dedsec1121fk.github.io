# SQLite FOREIGN KEY failed: validate parent lifecycle and enforcement

## Exact diagnosis
A child row may refer only to an existing parent unless the schema defines nullable or cascading behavior. Crucially, SQLite foreign-key enforcement is per connection and must be enabled where needed. A schema declaration without PRAGMA foreign_keys=ON can leave integrity unprotected in many configurations.

## Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
assert db.execute("PRAGMA foreign_keys").fetchone()[0] == 1
db.execute("CREATE TABLE users(id INTEGER PRIMARY KEY)")
db.execute("CREATE TABLE notes(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))")
try:
    db.execute("INSERT INTO notes(user_id) VALUES (99)")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("orphan accepted")
db.execute("INSERT INTO users(id) VALUES (99)")
db.execute("INSERT INTO notes(user_id) VALUES (99)")
assert db.execute("PRAGMA foreign_key_check").fetchall() == []
~~~

## Resolution procedure
Check PRAGMA foreign_keys at connection creation, then inspect PRAGMA foreign_key_list(notes). For unexpected delete failures, read ON DELETE rules: RESTRICT, CASCADE, SET NULL and NO ACTION have different effects. Fix the ordering of parent/child writes or the business lifecycle. Avoid globally disabling enforcement to let bad data through.

## Lab and boundary conditions
In a disposable database try deleting the parent while a child exists, then create a variant with ON DELETE CASCADE. Verify exactly which rows remain. For an existing file use PRAGMA foreign_key_check to detect legacy orphans.
