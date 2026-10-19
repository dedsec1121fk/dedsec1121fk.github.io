-- SQLite CLI: sqlite3 :memory: < 01_crud.sql
CREATE TABLE people(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO people(name) VALUES ('Ada'), ('Grace');
SELECT id, name FROM people ORDER BY id;
UPDATE people SET name = 'Ada Lovelace' WHERE name = 'Ada';
DELETE FROM people WHERE name = 'Grace';
SELECT count(*) AS remaining FROM people;
