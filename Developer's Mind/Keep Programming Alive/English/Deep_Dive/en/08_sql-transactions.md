# SQL transaction rollback and isolation

## What is happening
A transaction groups changes so that either all commit or none do. Use parameterized queries and commit only after validating every related operation.

## Practical investigation
Choose isolation deliberately: concurrent writes may cause lost updates or serialization conflicts. Demonstrate the scenario with two test connections.

## Common traps
Keep schema migrations reversible and test them on a disposable database containing representative sample data.

## Adaptable demonstration
```text
BEGIN;
UPDATE accounts SET active = 0 WHERE id = 42;
ROLLBACK;
```

## Model a transfer with two invariants
In a disposable database, store two balances 5 and 7. A transfer of 2 must leave 3 and 9; their sum stays 12. Inject failure after debiting but before crediting, roll back and confirm the original pair remains 5 and 7. Checking only the total would miss an incorrect transfer direction, so assert both rows as well as the sum.

Use a separate in-memory or temporary database for each test. SQLite's `:memory:` database is ordinarily private to that connection; creating two ordinary connections to that name does not automatically create a shared concurrency experiment. For a two-connection lock test, use the same temporary file and coordinate which transaction holds the write lock.

Database isolation and application retries interact. If a transaction fails, roll back its state before rerunning the operation, and determine whether the action is safe to repeat. A transaction is atomic within its database boundary; it does not roll back an email or HTTP request sent in the middle of the code.
