# Database transactions — all-or-nothing wallet transfer

## Domain contract
An offline wallet ledger moves positive integer cents from one existing account to another. No balance may become negative. A successful transfer preserves the sum of all balances; a missing destination or insufficient source funds must leave *every* balance unchanged. The two UPDATE statements form a single transaction. Never report a transfer completed after only the subtraction succeeded.

## Executable SQLite/Python 3 example
Save as transfer_lab.py and run python3 transfer_lab.py. The database exists only in memory, holds synthetic balances, uses bound parameters, and deliberately fails a transfer whose destination does not exist.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("""CREATE TABLE wallet(
    id INTEGER PRIMARY KEY,
    balance INTEGER NOT NULL CHECK(balance >= 0))""")
db.executemany("INSERT INTO wallet VALUES (?,?)",[(1,100),(2,0)])
db.commit()

def transfer(src, dst, amount):
    if type(amount) is not int or amount <= 0 or src == dst:
        raise ValueError("invalid transfer")
    with db:
        old = db.execute("SELECT balance FROM wallet WHERE id=?", (src,)).fetchone()
        if old is None or old[0] < amount:
            raise ValueError("insufficient or unknown source")
        db.execute("UPDATE wallet SET balance=balance-? WHERE id=?", (amount,src))
        updated = db.execute("UPDATE wallet SET balance=balance+? WHERE id=?",
                             (amount,dst)).rowcount
        if updated != 1:
            raise ValueError("unknown destination")

transfer(1,2,40)
assert db.execute("SELECT sum(balance) FROM wallet").fetchone()[0] == 100
try:
    transfer(1,99,10)
except ValueError:
    pass
else:
    raise AssertionError("unknown destination accepted")
assert db.execute("SELECT balance FROM wallet WHERE id=1").fetchone()[0] == 60
print("PASS: atomic transfer and rollback")
~~~

## How the guarantee works
The connection context manager commits after the successful body and rolls back when ValueError propagates. The first UPDATE of the failed transfer is therefore undone when the second UPDATE finds no destination. The CHECK constraint prevents negative balances but does not prove that a destination exists, nor does it protect against every concurrency race when transfers span multiple systems. In a file-backed multi-writer system, understand SQLite locking, transaction modes and busy timeouts; an in-memory single-connection test does not reproduce concurrent isolation anomalies.

## Bounded exercises and diagnostics
1. Transfer more than the source balance, zero cents, a boolean amount and an unknown source. Verify all fail with unchanged state.
2. Remove the row-count check for destination and observe a misleading successful return even though money disappears. Restore the validation.
3. Attempt to update two unrelated accounts during the same transaction and raise an exception. Confirm all updates roll back.
4. Repeat with a disposable file-backed database and two connections, checking visibility before and after commit without touching real financial records.

**Evidence:** PASS, sum-of-balances invariant, a missing-destination rollback and a clear explanation of isolation versus atomicity.
