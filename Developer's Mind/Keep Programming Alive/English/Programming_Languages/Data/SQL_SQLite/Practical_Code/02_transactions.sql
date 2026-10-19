CREATE TABLE accounts(name TEXT PRIMARY KEY, balance INTEGER NOT NULL CHECK (balance >= 0));
INSERT INTO accounts VALUES ('A', 100), ('B', 20);
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 15 WHERE name = 'A';
UPDATE accounts SET balance = balance + 15 WHERE name = 'B';
COMMIT;
SELECT * FROM accounts ORDER BY name;
