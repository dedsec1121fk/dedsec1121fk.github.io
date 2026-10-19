# Database indexes — verify an actual query plan

## Use case
A local catalogue searches a note by exact title. Without an index on the title, SQLite may need to inspect every row. An index can allow a targeted search and, when all selected columns are held in the index, a covering lookup. Indexes cost storage and make writes more expensive, so add them based on real workloads and measured plans rather than as decoration.

## Executable SQLite/Python 3 experiment
Save as index_lab.py and run python3 index_lab.py. Create 200 synthetic notes, inspect EXPLAIN QUERY PLAN for title equality, then add a title index and inspect the same bound query. The test checks the two expected plan descriptions on this SQLite fixture.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE docs(id INTEGER PRIMARY KEY,title TEXT NOT NULL)")
db.executemany("INSERT INTO docs(title) VALUES (?)",
               [(f"title-{i}",) for i in range(200)])
sql = "EXPLAIN QUERY PLAN SELECT title FROM docs WHERE title=?"
before = db.execute(sql, ("title-11",)).fetchall()
db.execute("CREATE INDEX idx_docs_title ON docs(title)")
after = db.execute(sql, ("title-11",)).fetchall()
assert any("SCAN docs" in line[3] for line in before), before
assert any("USING COVERING INDEX idx_docs_title" in line[3]
           for line in after), after
print("PASS: scan before index, indexed search afterward")
~~~

## Interpret the evidence carefully
A SCAN docs step means SQLite scans the table. After CREATE INDEX, the plan should include SEARCH ... USING COVERING INDEX idx_docs_title for the exact-title SELECT, because the index contains the selected title. This observation is not a universal performance benchmark; for tiny tables the planner may decide a scan is faster, and a different predicate or collation may prevent the chosen index from being useful. A unique index also enforces uniqueness, whereas the demonstrated ordinary index does not.

## Bounded exercises and diagnostics
1. Change SELECT title to SELECT id,title and inspect whether the index still covers the result in SQLite rowid tables.
2. Use WHERE title LIKE with a leading wildcard. Explain why a normal B-tree index is unlikely to help for arbitrary suffix searches.
3. Measure insert time with and without the index for a fixed synthetic dataset. Report sizes, SQLite version and at least three runs.
4. Add a second query sorted by title and compare a query plan with and without the index; separate indexing needs from correctness constraints.

**Evidence:** PASS, complete before/after query plans, the matching predicate and a note on index maintenance cost.
