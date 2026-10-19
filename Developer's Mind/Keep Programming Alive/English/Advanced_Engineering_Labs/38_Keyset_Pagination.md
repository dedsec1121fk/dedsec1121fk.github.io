# Keyset pagination with stable ordering

## Mechanism and contract

Offset pagination asks a database to skip a number of rows. Concurrent inserts before that offset can move the boundary, causing duplicates or gaps between pages. Keyset pagination asks for rows after the last observed ordering key. The ordering must be total: a timestamp alone is not enough when multiple rows share it. Add a unique tie-breaker such as an integer ID.

A cursor is a continuation contract, not a secret authorization token. Bind it to the query, sort direction and tenant context; authenticate opaque cursors when tampering would change permitted behavior. Still perform ordinary access checks on every page. Keyset pagination reduces boundary movement, but it does not magically provide a single historical snapshot when rows are updated or removed during traversal.

## Worked local example

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(":memory:")) as db:
    db.execute("CREATE TABLE events(ts INTEGER, id INTEGER PRIMARY KEY)")
    db.executemany("INSERT INTO events VALUES (?, ?)", [(10,1),(10,2),(11,3)])
    page = db.execute("SELECT ts,id FROM events ORDER BY ts,id LIMIT 2").fetchall()
    cursor = page[-1]
    next_page = db.execute(
        "SELECT ts,id FROM events WHERE (ts,id) > (?,?) ORDER BY ts,id LIMIT 2",
        cursor).fetchall()
    assert page == [(10,1),(10,2)] and next_page == [(11,3)]
print("tie boundary handled")
```

## Failure checks and limits

Test equal timestamps, empty results, reverse sorting and a deleted cursor row. Persist the cursor's ordering values rather than requiring that its row still exist. Explain to callers whether the API provides live traversal or snapshot semantics. Compare query plans on realistic data before promising performance from the word cursor alone.

## Primary reference

[Official documentation](https://www.sqlite.org/rowvalue.html)
