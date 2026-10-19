# SQLite: no such column — inspect the actual schema and aliases

**Environment:** SQLite SQL execution or statement preparation.

## What the error means
SQLite cannot resolve a name as a column visible at that point in the query. Common causes: an outdated table definition, a typo, referencing an alias in a clause where it is not visible, or querying the wrong database file. Do not guess which migration ran; read the schema currently open by the process.

## Safe local experiment
Run `sqlite3 :memory:` and enter:
~~~sql
CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
INSERT INTO tasks (title) VALUES ('review');
SELECT status FROM tasks; -- Error: no such column: status
PRAGMA table_info(tasks);
SELECT title FROM tasks; -- review
~~~
The `PRAGMA` output lists `id` and `title`, not `status`. A valid qualified query is `SELECT t.title FROM tasks AS t;`. If a query uses `t.title` before declaring alias `t`, check its FROM/JOIN clause.

## Production investigation
1. Capture the exact failing SQL (with input values redacted) and the database connection target. SQLite files with identical names in different working directories are different databases.
2. Run `PRAGMA database_list;`, `PRAGMA table_info(tasks);` or `SELECT sql FROM sqlite_schema WHERE name='tasks';` **read-only** first.
3. Compare the live schema with version-controlled migrations and the expected release. Test migrations against a disposable copy before changing data.
4. Fix the query if the column name was wrong. If schema evolution is intended, create a reviewed migration with backups and rollback notes. Never blindly add columns merely to silence an error.
5. Reproduce both with a fresh database and a copy of an older schema; this catches upgrade-only failures.

## Common trap
Quoted string handling differs from column resolution; avoid relying on SQLite's historical permissive double-quoted-string behavior. Parameter placeholders protect **values**, not arbitrary identifier names: choose permitted table/column identifiers from a fixed allowlist when SQL is constructed dynamically.
