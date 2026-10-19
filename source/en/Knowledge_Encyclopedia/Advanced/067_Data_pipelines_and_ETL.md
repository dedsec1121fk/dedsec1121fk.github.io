# ETL pipelines — atomic batches, replay and conflicting records

## Scenario
A local synchronizer receives a sequence of item IDs and statuses. It should validate before insertion, store accepted rows, and permit identical input to be replayed after a crash without introducing duplicates. An identical ID paired with different content is *not* automatically safe to overwrite: it may indicate a corrupt source, a version conflict or an actual update with a different schema. This exercise chooses to reject conflicts rather than invent update semantics.

## Runnable SQLite/Python lab
Save as etl_lab.py and run python3 etl_lab.py. The database is entirely in memory, uses bound parameters, and tests rollback after an error late in a batch.

~~~python
import sqlite3

def etl(db, records):
    for identifier, status in records:
        if type(identifier) is not int or identifier <= 0:
            raise ValueError("invalid ID")
        if status not in {"new", "done"}:
            raise ValueError("invalid status")
        old = db.execute("SELECT status FROM item WHERE id=?", (identifier,)).fetchone()
        if old:
            if old[0] != status:
                raise ValueError("conflicting replay")
        else:
            db.execute("INSERT INTO item VALUES (?,?)", (identifier, status))

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE item (id INTEGER PRIMARY KEY, status TEXT NOT NULL)")
with db:
    etl(db, [(1, "new"), (2, "done")])
with db:
    etl(db, [(1, "new"), (2, "done")])
assert db.execute("SELECT count(*) FROM item").fetchone()[0] == 2
try:
    with db:
        etl(db, [(3, "new"), (2, "new")])
except ValueError:
    pass
else:
    raise AssertionError("conflicting replay accepted")
assert db.execute("SELECT count(*) FROM item").fetchone()[0] == 2
print("PASS: replay, conflict detection, atomic rollback")
~~~

## Atomicity and checkpoint semantics
The sqlite3 context manager commits the transaction when its body exits successfully and rolls it back if an exception propagates. When the second row of the failing batch conflicts, the earlier row with ID 3 must also disappear. This prevents partially applied batches. A durable ETL pipeline should advance its checkpoint only in the same transaction as the rows it considers committed, otherwise crash recovery can skip data or repeat uncommitted work. Retried upserts are not automatically correct when source records can change without a version or timestamp.

## Hands-on fault boundaries
1. Replace the second replay with a feed containing an identical ID but changed status. Capture the conflict and verify the old row remains.
2. Reverse the order of the failing batch: compare the immediate error position with the final stored state. Test a separate invalid status and a negative ID.
3. Store a source version with each ID and define an explicit policy for an authorized update. Show how that differs from blind INSERT OR REPLACE.
4. Create a disposable file-based SQLite database, close and reopen it, and show that a committed checkpoint survives process exit. Never use a production database as a fixture.

**Evidence:** PASS, before/after row counts, a crash-replay matrix and a documented contract for conflicting data. The demonstration models small batches, not a streaming job controller.
