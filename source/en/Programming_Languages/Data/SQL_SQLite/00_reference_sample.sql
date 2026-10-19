CREATE TABLE people (name TEXT NOT NULL);
INSERT INTO people(name) VALUES ('Ada'), ('Grace');
SELECT 'Hello, ' || name || '!' AS greeting FROM people;
