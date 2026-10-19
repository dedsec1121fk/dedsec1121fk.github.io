# SQL parameterization — data stays data

## The trust boundary
A SQL parameter placeholder represents a **value**, not executable query syntax. Binding values prevents user text from changing SQL structure, but it does not validate business rules or grant database permissions. Table names and ORDER BY column identifiers require explicit allowlists; placeholders cannot safely stand in for arbitrary identifiers.

## Runnable sqlite3 exercise
~~~python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE inventory (sku TEXT PRIMARY KEY, qty INTEGER)")
db.executemany(
    "INSERT INTO inventory(sku, qty) VALUES (?, ?)",
    [("bolt", 4), ("nut", 2)],
)
input_sku = "bolt' OR 1=1 --"
found = db.execute(
    "SELECT qty FROM inventory WHERE sku = ?", (input_sku,)
).fetchall()
assert found == []
valid = db.execute(
    "SELECT qty FROM inventory WHERE sku = ?", ("bolt",)
).fetchone()
assert valid == (4,)
db.close()
~~~
A parameter is transmitted as a value; the apostrophe in the malicious-looking string cannot create an OR clause. The negative test returns no matching SKU. Dynamic SQL created by string concatenation would not have this separation.

## Deeper checks
1. Use a positive test with a quote inside a legitimate SKU. Query it exactly with a bound value.
2. Try replacing the table name using a placeholder and record the syntax error. Choose a table name from a fixed, reviewed mapping instead.
3. For a user-selected sort order, map a symbolic option to a known literal SQL fragment; do not concatenate raw user input.
4. Test invalid quantities separately: parameterization does not reject -5 unless a CHECK constraint or application validation requires it.
5. Wrap multiple writes in a transaction and test a deliberate constraint violation. Confirm the database state after rollback.

## Acceptance and limits
Run the assertions in a temporary in-memory SQLite database, review the query text and check that no user value is concatenated into SQL. Other database drivers use different placeholder syntax. Parameterization does not replace authorization or least-privilege database accounts.
