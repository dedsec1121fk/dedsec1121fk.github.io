# Transactional outbox and duplicate delivery

## Mechanism and contract

Updating a database and publishing an event are two separate effects. A crash between them can leave a changed record without its notification, or publish a notification for a rolled-back change. An outbox stores the business update and a pending event in the same database transaction. A separate publisher later delivers pending events.

The publisher can crash after the receiver accepts an event but before marking it delivered. Therefore an outbox commonly gives at-least-once delivery, not automatic exactly-once processing. Consumers need stable event IDs and an atomic way to record deduplication together with their local effect. The example proves only the database atomicity boundary; no network delivery is simulated.

## Worked local example

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(":memory:")) as db:
    db.executescript("CREATE TABLE orders(id TEXT PRIMARY KEY);"
                     "CREATE TABLE outbox(id TEXT PRIMARY KEY, body TEXT);")
    try:
        with db:
            db.execute("INSERT INTO orders VALUES (?)", ("order-1",))
            db.execute("INSERT INTO outbox VALUES (?,?)", ("event-1","created"))
            raise RuntimeError("fixture crash before commit")
    except RuntimeError:
        pass
    assert db.execute("SELECT count(*) FROM orders").fetchone() == (0,)
    assert db.execute("SELECT count(*) FROM outbox").fetchone() == (0,)
print("both effects rolled back")
```

## Failure checks and limits

Repeat with a successful commit and verify both rows exist. In a publisher design, specify retry ownership, poison-event handling, delivery age alarms and retention of acknowledged IDs. Never delete an outbox row before the delivery contract is satisfied. Test consumer deduplication separately: a transactional source cannot guarantee atomicity inside an unrelated remote system.

## Primary reference

[Official documentation](https://www.sqlite.org/lang_transaction.html)
