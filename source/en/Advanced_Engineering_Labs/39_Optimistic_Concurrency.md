# Optimistic concurrency and lost-update prevention

## Mechanism and contract

Two editors can both read revision 4, change different fields and overwrite each other if updates only identify the row. An optimistic update also requires that the revision still equal the version read. Exactly one conflicting update succeeds. The rejected editor must fetch the current representation and merge or ask the user; blindly retrying the old body defeats the check.

On HTTP APIs this contract can use a strong ETag from a read and If-Match on a state-changing request. A stale precondition normally yields 412. The validator must cover the representation being protected, and the comparison and write must be one atomic server-side operation. A client-only check creates another race. The SQL exercise illustrates the same principle without starting a server.

## Worked local example

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(":memory:")) as db:
    db.execute("CREATE TABLE doc(id INTEGER PRIMARY KEY, rev INTEGER, body TEXT)")
    db.execute("INSERT INTO doc VALUES (1,4,'old')")
    sql = "UPDATE doc SET body=?,rev=rev+1 WHERE id=? AND rev=?"
    first = db.execute(sql, ("editor A",1,4)).rowcount
    second = db.execute(sql, ("editor B",1,4)).rowcount
    assert (first, second) == (1, 0)
    assert db.execute("SELECT body FROM doc").fetchone() == ("editor A",)
print("stale write rejected")
```

## Failure checks and limits

Verify zero affected rows is surfaced as a conflict, not reported as success. Test missing rows separately from stale rows according to the API's information-disclosure policy. Keep authorization checks inside the write transaction. Revision counters detect interference; they do not decide whether two edits are semantically safe to merge.

## Primary reference

[Official documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match)
