import sqlite3

def demo():
    with sqlite3.connect(':memory:') as con:
        con.execute('CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0)')
        con.execute('INSERT INTO tasks (title) VALUES (?)', ('Learn SQLite',))
        con.execute('UPDATE tasks SET done=? WHERE id=?', (1,1))
        return con.execute('SELECT title, done FROM tasks ORDER BY id').fetchall()

if __name__ == '__main__':
    assert demo() == [('Learn SQLite',1)]
    print(demo())
