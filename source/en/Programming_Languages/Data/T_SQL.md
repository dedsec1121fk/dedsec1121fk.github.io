# t_sql — consolidated language guide

## Transact-SQL

### Working model
T-SQL extends SQL for Microsoft SQL Server with procedural control, variables and SQL Server-specific functions.

### Focused source example
```text
DECLARE @n int = 3;
SELECT @n * @n AS squared;
```

Use a throwaway database to contrast read-only SELECT with a transaction that explicitly rolls back a sample change.

### Evidence to collect
Record the exact T_SQL compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Never port TOP, identity or date arithmetic syntax to SQLite/PostgreSQL unchanged; validate vendor dialect.

## T SQL: applied exercises

### Replace server-dependent catalogue data
The starter uses `sys.databases`, whose names depend on permissions and server state. That is useful for discovery but poor for a repeatable test. In a disposable Microsoft SQL Server database session, use a local temporary table instead:

~~~sql
CREATE TABLE #scores (name varchar(20) NOT NULL, score int NULL);
INSERT INTO #scores (name, score)
VALUES ('Ada', 2), ('Lin', 5), ('Ava', 5), ('Noah', NULL);
SELECT TOP (2) name, score
FROM #scores
ORDER BY score DESC, name ASC;
DROP TABLE #scores;
~~~

Expected rows are `Ava, 5` and `Lin, 5`. The secondary sort by name resolves the tie; omitting it means two rows with score 5 do not have a reliably specified relative order. Run each query in a suitable SQL Server client and record version and actual output; no server run is claimed here.

### Reason about NULL
Repeat a selection using `WHERE score >= 2`. The row with NULL does not satisfy the predicate, but this does **not** assert that NULL equals zero. In SQL's three-valued logic, comparisons with NULL usually evaluate to UNKNOWN. Select the missing values explicitly with `WHERE score IS NULL`. Do not confuse a missing value with an absent row.

### Isolate conversion failure
Compare `SELECT TRY_CONVERT(int, 'oops') AS parsed` against `SELECT CONVERT(int, 'oops') AS parsed` in separate statements. The former is expected to return NULL for this conversion; the latter raises a conversion error. Capture the exact error number. A `TRY_CONVERT` result of NULL requires a deliberate policy, not automatic insertion of zero.

### Independent extension
Add one more person with score 5 and request a stable first two by score and name. Then request all top-scoring ties using `TOP (1) WITH TIES` **ordered only by score DESC**; compare the different cardinalities. Explain why `TOP` is T-SQL syntax, not interchangeable with `LIMIT` in every SQL dialect. Clean up the scratch table in a dedicated session. Documentation: https://learn.microsoft.com/sql/t-sql/
