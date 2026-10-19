# Database relation access and shell parsing failures

## relation does not exist

### Exact diagnosis
PostgreSQL error 42P01 reports an unresolved relation name. The table may exist in another database or schema, may be absent because migrations did not run, or may require a quoted mixed-case identifier. Unquoted identifiers are folded to lowercase in PostgreSQL; this differs from naive expectations when importing schemas.

### Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~sql
-- Execute on an isolated PostgreSQL database, not production.
SELECT current_database(), current_schema();
SHOW search_path;
SELECT to_regclass('public.orders');
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name ILIKE 'orders';
-- Compare public.orders with explicitly quoted "Orders".
~~~

### Resolution procedure
First confirm which connection string and database the application really uses. Inspect current_schema() and search_path, then qualify the relation as schema_name.table_name. Verify migration state and ownership without creating tables just to silence the error. Dynamic identifiers must be composed with safe identifier quoting, not value placeholders.

### Lab and boundary conditions
Create a table in a dedicated lab schema; show that an unqualified lookup may fail when search_path excludes that schema but a qualified lookup succeeds. Compare names orders and "Orders". Clean up only the temporary lab schema.

## permission denied for relation

### Exact diagnosis
PostgreSQL error 42501 indicates insufficient privilege on an object for the current role. Permission on the database is not the same as permission on a particular table or schema. Table SELECT privileges, schema USAGE, sequences used by inserts and row-level security can be separate issues. Do not switch the application to a superuser to make the error disappear.

### Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~sql
-- Run read-only role checks as an authorized operator:
SELECT current_user, session_user, current_database();
SELECT has_schema_privilege(current_user, 'public', 'USAGE');
SELECT has_table_privilege(current_user, 'public.orders', 'SELECT');
-- Inspect granted privileges through information_schema
-- or psql \dp for the specific relation.
~~~

### Resolution procedure
Capture the required operation (SELECT, INSERT, UPDATE or DELETE) and the effective database role. Inspect schema USAGE, table grants and relevant sequence permissions. A database administrator should grant the minimum privileges to the intended role after review; avoid GRANT ALL to PUBLIC. For row-level security, distinguish a denied table privilege from permitted SQL returning zero visible rows.

### Lab and boundary conditions
In a disposable PostgreSQL database create a read-only test role, grant schema USAGE and SELECT on one table, and verify reading succeeds while INSERT fails. Record the exact grant and revoke commands for cleanup, and confirm unrelated tables remain inaccessible.

## unexpected EOF while looking for matching

**Language / environment:** Bash

### Meaning
A quote or block delimiter is not closed.

### Repair
Check quotes and here-doc terminators above the final reported line.
