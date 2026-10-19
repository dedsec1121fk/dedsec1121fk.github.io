import sqlite3
from pathlib import Path
path = Path(__file__).resolve().parent / "example_output" / "notes.sqlite3"
path.parent.mkdir(exist_ok=True)
with sqlite3.connect(path) as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
    conn.execute("INSERT INTO notes(title) VALUES (?)", ("Learn SQLite",))
    rows = conn.execute("SELECT title FROM notes WHERE title LIKE ?", ("%SQL%",)).fetchall()
print(rows)
