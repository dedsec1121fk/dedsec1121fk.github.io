# SQLite no such table: distinguish schema absence from wrong file

## Exact diagnosis
An SQLite connection can succeed while pointing to an empty database. sqlite3.connect('name.db') creates that file if it does not exist; the next SELECT may fail with no such table. This is different from a missing table due to unapplied migrations, an attached database requiring schema qualification or a typo in the SQL.

## Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~python
import sqlite3
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as root:
    file = Path(root) / "catalog.db"
    db = sqlite3.connect(file)
    try:
        db.execute("SELECT * FROM products")
    except sqlite3.OperationalError as exc:
        assert "no such table" in str(exc)
    db.execute("CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT NOT NULL)")
    db.execute("INSERT INTO products(name) VALUES (?)", ("book",))
    assert db.execute("SELECT name FROM products").fetchone()[0] == "book"
    print(db.execute("PRAGMA database_list").fetchall())
    db.close()
~~~

## Resolution procedure
Log the resolved absolute database location (excluding sensitive user paths from shared logs). Inspect PRAGMA database_list and SELECT name,sql FROM sqlite_schema WHERE type='table'. Confirm whether the expected migration ran and which schema it targets. For read-only diagnostics use sqlite3.connect('file:/absolute/path?mode=ro', uri=True) so a typo cannot create a new empty file.

## Lab and boundary conditions
Run the example twice with different temporary paths, explain why two catalog.db filenames can be distinct databases, then build a startup migration check that fails clearly if the expected schema version is absent.
