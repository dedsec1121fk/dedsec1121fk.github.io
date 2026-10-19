# SQLite database is locked: reproduce writer contention safely

## Exact diagnosis
SQLite permits concurrent readers but serializes writers. An open write transaction can block another connection; timeout controls how long to wait, not whether the data conflict is semantically safe to retry. Long transactions, idle cursors and forgotten rollback calls often cause persistent lock complaints.

## Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~python
import sqlite3
from tempfile import TemporaryDirectory
from pathlib import Path
with TemporaryDirectory() as d:
    file = Path(d) / "test.db"
    one = sqlite3.connect(file, timeout=0)
    two = sqlite3.connect(file, timeout=0)
    one.execute("CREATE TABLE events(v INTEGER)")
    one.commit()
    try:
        one.execute("BEGIN IMMEDIATE")
        one.execute("INSERT INTO events VALUES (1)")
        try:
            two.execute("INSERT INTO events VALUES (2)")
        except sqlite3.OperationalError as exc:
            assert "locked" in str(exc).lower()
        else:
            raise AssertionError("second writer unexpectedly succeeded")
    finally:
        one.rollback()
    two.execute("INSERT INTO events VALUES (2)")
    two.commit()
    one.close()
    two.close()
~~~

## Resolution procedure
Determine which connection holds an uncommitted transaction. Use short transactions, explicit close/rollback paths and bounded busy timeouts. WAL mode can improve reader/writer concurrency but does not allow two simultaneous SQLite writers. For a persistent production lock, capture request durations and transaction boundaries before tuning timeouts.

## Lab and boundary conditions
Replace rollback with commit after releasing the conflicting transaction and test the resulting row count. Evaluate whether automatic retry could duplicate a payment-like event and design an idempotency key before adding a retry loop.
