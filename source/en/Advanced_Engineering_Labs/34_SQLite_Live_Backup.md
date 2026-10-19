# SQLite live backup and restoration drills

## Mechanism and contract

A live SQLite database may have committed pages in its WAL file. Copying only the main file while writers run is not a consistent backup procedure. Treat the database connection as the source of a snapshot and give the backup a separate destination connection. The example creates disposable data inside a temporary directory; it never opens an application database.

A backup is useful only when the application can read the restored copy. Here the restored query must return exactly one record, while integrity_check must return ok. A successful checksum alone proves byte identity, not that the schema, rows and application assumptions are usable. For a real recovery plan, record database version, application version, backup time, encryption dependencies and a separate storage location.

## Worked local example

```python
import sqlite3, tempfile
from contextlib import closing
from pathlib import Path
with tempfile.TemporaryDirectory() as folder:
    root = Path(folder)
    with closing(sqlite3.connect(root / "live.db")) as src:
        src.execute("PRAGMA journal_mode=WAL")
        src.execute("CREATE TABLE notes(id INTEGER PRIMARY KEY, body TEXT)")
        src.execute("INSERT INTO notes(body) VALUES (?)", ("fixture",))
        src.commit()
        with closing(sqlite3.connect(root / "restore.db")) as dst:
            src.backup(dst)
            assert dst.execute("PRAGMA integrity_check").fetchone() == ("ok",)
            assert dst.execute("SELECT body FROM notes").fetchall() == [("fixture",)]
print("backup restored")
```

## Failure checks and limits

Inject a deliberately missing row in a second fixture and prove that the application-level assertion catches it even if integrity_check still says ok. Do not delete WAL files to “repair” a busy database. Schedule bounded backup work, monitor disk space and rehearse recovery without overwriting the original.

## Primary reference

[Official documentation](https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.backup)
