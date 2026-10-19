# Glossary: logging, leaks and schema migrations

## Logging

### Definition and boundaries
Recording contextual events with severity levels, timestamps and correlation IDs for diagnosis. Logs are observable output that can leak tokens or personal data if unsanitized.

### Working miniature
~~~text
import logging
logging.basicConfig(level=logging.INFO)
logging.info('processed %d records',3)
~~~

### Guided investigation
Log a rejected record with a synthetic request ID while deliberately omitting credentials. Check which fields reach the handler, not only the console text.

### Check your understanding
For Logging, change one input in the example and explain whether the observed behavior still satisfies the stated definition. Record the exact output and distinguish a program error from a mistaken assumption.

## Memory leak

### Definition and boundaries
Unexpected retention of objects past their useful lifetime. Long-lived caches, callbacks or references can cause this even with a garbage collector. High memory use from legitimate data is not necessarily a leak.

### Working miniature
~~~text
from collections import deque
recent=deque(maxlen=10)
for n in range(10000): recent.append(n)
assert len(recent)==10
~~~

### Guided investigation
Compare an unbounded list with this bounded deque under repeated inputs. Use tracemalloc snapshots to identify retained allocations instead of guessing.

### Retained references make objects live longer
An object may remain reachable through a growing registry even when its original local variable is deleted. Use a weak reference to observe this without exhausting memory.

~~~python
import gc, weakref
class Entry: pass
registry = []
entry = Entry()
watch = weakref.ref(entry)
registry.append(entry)
del entry
gc.collect()
assert watch() is not None
registry.clear()
gc.collect()
assert watch() is None
~~~

Design a cache with a 100-entry maximum, then compare object retention after thousands of unique keys. Resident-set size alone is not sufficient to prove a leak because allocators may keep free pools; inspect surviving objects and owners.

## Migration

### Definition and boundaries
A controlled upgrade from one data schema or service version to another. Migrations must consider existing rows, partial deployment and rollback options rather than editing a schema once.

### Working miniature
~~~text
CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT);
ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
~~~

### Guided investigation
Use a disposable SQLite database containing older rows; verify that the new archived field is 0 and plan how a rollback would handle it.

### Upgrade old rows without losing their values
A schema migration is successful only if existing records remain valid and the new schema is compatible with the application.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT)")
db.execute("INSERT INTO tasks(title) VALUES (?)", ("review",))
with db:
    db.execute("ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0")
assert db.execute("SELECT title,archived FROM tasks").fetchone() == ("review",0)
db.close()
~~~

Extend the lab with PRAGMA user_version and execute the upgrade twice. The second pass should detect that the new version is already installed. For destructive migrations, plan backups and rollback before applying changes; DDL transaction semantics vary across engines.
