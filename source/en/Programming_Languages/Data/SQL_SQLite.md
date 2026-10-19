# sql_sqlite — consolidated language guide

## SQL (SQLite)

**Typical use:** Databases and data languages.

**Suggested file extension:** `.sql`.

**How to run / environment:** sqlite3 :memory: < hello.sql.

### Starter example

```
CREATE TABLE people (name TEXT NOT NULL);
INSERT INTO people(name) VALUES ('Ada'), ('Grace');
SELECT 'Hello, ' || name || '!' AS greeting FROM people;
```

### How to read it

SQL is declarative; always parameterize user input in apps.

### Common pitfall

SQL is declarative; always parameterize user input in apps. 

### Design data and transactions before queries
SQL rows model relations, not arbitrary text files. Declare primary keys and foreign keys deliberately, use parameter placeholders for data values, and wrap dependent writes in a transaction. SQLite foreign keys are not always enabled by default for each connection; enable them if the application relies on enforcement.
```python
import sqlite3
with sqlite3.connect(":memory:") as db:
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("CREATE TABLE tasks(id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
    db.execute("INSERT INTO tasks(title) VALUES (?)", ("Review tools",))
    assert db.execute("SELECT title FROM tasks WHERE id=?", (1,)).fetchone()==("Review tools",)
```
`SELECT` without `ORDER BY` has no guaranteed user-friendly order. Indexing frequently filtered columns can help but costs space/writes; use `EXPLAIN QUERY PLAN` on representative queries and measure. SQLite uses transactional durability options; understand when your workload needs them.

**Exercise:** make a task/comments schema with a foreign key, test a rejected orphan comment, and show that a failing operation rolls back. Source: https://www.sqlite.org/lang.html.

## SQL_SQLite — Expanded practice workbook

### Model the invariant
Stock must never be negative, names must be unique and a logical update must be committed or rolled back in a controlled way. Use an in-memory SQLite database so the exercise cannot overwrite a real project database.

### Execute the lab
Save as stock.sql. Run sqlite3 :memory: < stock.sql after installing the SQLite CLI. Two query rows should each say Pencil|7. The second SELECT demonstrates that rollback restored the committed stock.

~~~sql
PRAGMA foreign_keys = ON;
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);
INSERT INTO items(name, stock) VALUES ('Pencil', 10);
BEGIN IMMEDIATE;
UPDATE items SET stock = stock - 3
WHERE name = 'Pencil' AND stock >= 3;
COMMIT;
SELECT name, stock FROM items;
BEGIN;
UPDATE items SET stock = 0 WHERE name = 'Pencil';
ROLLBACK;
SELECT name, stock FROM items;
EXPLAIN QUERY PLAN SELECT id FROM items WHERE name = 'Pencil';
~~~

### What is guaranteed
CHECK (stock >= 0) rejects invalid final values. UNIQUE(name) creates an index, so adding another index on name would be redundant. BEGIN IMMEDIATE tries to obtain a write transaction immediately, which can fail with SQLITE_BUSY if another writer is active. The guarded UPDATE will not decrement stock below 3.

### Lab extensions
Run SELECT changes(); immediately after an UPDATE to see whether it matched a row. Attempt a duplicate name and note the constraint failure. Build a related table using FOREIGN KEY and test an invalid reference; foreign-key enforcement is set per connection with PRAGMA foreign_keys = ON. Use EXPLAIN QUERY PLAN to see how a UNIQUE constraint affects search.

### Real-world boundary
In application code bind external values as prepared-statement parameters; these hard-coded SQL literals are for a fixed offline lab only. If you see database is locked, investigate the writer and transaction duration before raising busy_timeout. Do not assume other SQL dialects have identical transaction or auto-increment rules.
Success: two unchanged results of 7 and a query plan. https://www.sqlite.org/lang_transaction.html

## SQL_SQLite — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `sqlite3 :memory: < {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## SQL_SQLite — Focused mastery pathway

### Goal and acceptance criteria
Build an offline catalog with tasks, tags and a join table. A successful run must insert linked records, reject a missing tag without leaving an orphaned task, use bound SQL parameters and confirm that an indexed title lookup has a search plan. No network service or external database is needed. SQLite accepts multiple readers but coordinates writes, so tests must distinguish query correctness from concurrent-writer behavior.

### Executable lab (Python 3.9+ and built-in sqlite3)
Save the following as SqliteLab.py and run python3 SqliteLab.py. It creates an in-memory database only and prints PASS after checking every invariant.

~~~python
import sqlite3

with sqlite3.connect(':memory:') as db:
    db.execute('PRAGMA foreign_keys = ON')
    db.executescript('''
        CREATE TABLE task (id INTEGER PRIMARY KEY, title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 80));
        CREATE TABLE tag (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
        CREATE TABLE task_tag (task_id INTEGER REFERENCES task(id),
                               tag_id INTEGER REFERENCES tag(id),
                               PRIMARY KEY(task_id,tag_id));
    ''')
    with db:
        db.execute('INSERT INTO task VALUES (?,?)', (1, 'audit'))
        db.execute('INSERT INTO tag VALUES (?,?)', (10, 'urgent'))
        db.execute('INSERT INTO task_tag VALUES (?,?)', (1, 10))
    before = db.execute('SELECT count(*) FROM task').fetchone()[0]
    try:
        with db:
            db.execute('INSERT INTO task VALUES (?,?)', (2, 'temporary'))
            db.execute('INSERT INTO task_tag VALUES (?,?)', (2, 999))
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError('missing foreign-key rejection')
    assert db.execute('SELECT count(*) FROM task').fetchone()[0] == before
    assert db.execute('SELECT title FROM task WHERE id = ?', (1,)).fetchone() == ('audit',)
    db.execute('CREATE INDEX task_title_idx ON task(title)')
    plan = db.execute('EXPLAIN QUERY PLAN SELECT * FROM task WHERE title = ?', ('audit',)).fetchall()
    assert any('task_title_idx' in step[3] for step in plan), plan
    assert db.execute('PRAGMA foreign_keys').fetchone()[0] == 1
    print('PASS: rollback, FK, parameterization, indexed lookup')
~~~

### Experiments and bounded exercises
1. Replace the valid tag ID 10 with 999 in the *first* transaction. Predict which statements roll back and capture the IntegrityError. Revert the edit afterwards.
2. Remove PRAGMA foreign_keys. Record whether the missing reference now succeeds; restore the pragma immediately. Foreign-key enforcement is connection-local in SQLite.
3. Insert a duplicate link (1,10): the composite primary key must reject it. Insert an empty title: CHECK(length(title) BETWEEN 1 AND 80) must reject it. Extend the test with title length 81.
4. Repeat with a file-backed temporary database and two connections: before commit, the second connection must not see an uncommitted task. Set a busy timeout and capture a write contention case separately; do not assume timing is identical across systems.

### Diagnose failures and prove completion
If the FK violation is silently accepted, check PRAGMA foreign_keys on the *same* connection before the insert. If EXPLAIN QUERY PLAN does not mention task_title_idx, confirm the predicate uses title equality; the query planner can choose differently for other data volumes or predicates. If you see database is locked, check for a long writer transaction and verify transaction boundaries rather than disabling constraints.

**Deliverables:** program output, a table of before/after row counts for both success and failure, the query-plan output, and one explanation of why string interpolation is unsafe for user SQL input. The complete exercise is limited to this synthetic catalog; never run destructive migrations against personal data.

## SQL SQLite — Technical notes and common pitfalls

### Core knowledge

1. SQLite supports transactions and parameter binding in its host APIs.
2. NULL is not equal to any ordinary value; use IS NULL rather than = NULL.
3. Indexes improve some reads at extra storage and write costs; inspect query plans.
## Further engineering detail

Backup tests need two levels of evidence: structural integrity and the actual queries the application depends on. A readable file with a missing business row can pass integrity checks. Keep restoration fixtures separate from the live database and verify them before calling a backup usable.

[SQLite live backup and restoration drills](#read:fieldnotes-en-34)
