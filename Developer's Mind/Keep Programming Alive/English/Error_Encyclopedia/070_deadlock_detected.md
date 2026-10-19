# PostgreSQL deadlock detected: enforce lock ordering and safe retries

## Exact diagnosis
PostgreSQL deadlock SQLSTATE 40P01 occurs when transactions form a cycle of waits: neither can progress. The server detects the cycle and aborts one transaction. Increasing the timeout does not remove the conflicting lock order. Contention without a cycle can cause waits or lock timeouts but is not the same diagnosis.

## Disposable reproduction or inspection
Run only on an isolated local database or an authorized nonproduction environment.
~~~sql
-- Shared lab table in an isolated database; two sessions are required:
CREATE TABLE deadlock_lab_balances (id INTEGER PRIMARY KEY, amount INTEGER);
INSERT INTO deadlock_lab_balances VALUES (1, 100), (2, 100);
-- Connection A: BEGIN; UPDATE deadlock_lab_balances SET amount=amount+1 WHERE id=1;
-- Connection B: BEGIN; UPDATE deadlock_lab_balances SET amount=amount+1 WHERE id=2;
-- A then updates id=2; B then updates id=1 (deadlock cycle).
-- Prefer both transactions updating ids in ascending order.\n-- Drop the lab table after both sessions finish: DROP TABLE deadlock_lab_balances;
~~~

## Resolution procedure
Collect database deadlock diagnostics and application transaction traces, with query parameters redacted. Keep transactions short, take locks in consistent order and avoid calling external services while holding locks. PostgreSQL aborts a deadlocked transaction: retry the WHOLE transaction with bounded exponential backoff only when the operation is idempotent or otherwise safe. Never retry one statement after a failed transaction without proper rollback.

## Lab and boundary conditions
Use two PostgreSQL sessions with permanent test tables (TEMP tables are not shared across sessions) to reproduce conflicting row-lock order, then align both sessions to ascending id order. Compare the event to a lock timeout and document the different SQLSTATE values.
