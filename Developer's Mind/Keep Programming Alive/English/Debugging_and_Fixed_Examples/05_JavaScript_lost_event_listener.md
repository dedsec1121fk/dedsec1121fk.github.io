# Debugging UI events, parameterized SQL and shell paths

## JavaScript: lost event listener

### Broken example — DO NOT USE

```text
container.innerHTML = `<button id="save">Save</button>`;
// old save button listener was attached before innerHTML changed
```

### Fixed example

```text
container.innerHTML = `<button id="save">Save</button>`;
container.querySelector("#save").addEventListener("click", save);
```

### Why it fails and the repair works

Replacing markup removes listeners on replaced nodes.

### Root cause and precise failure
An event listener attaches to a particular DOM node. Replacing a parent through innerHTML creates new nodes whose appearance may be identical but whose old listeners are gone.

### Repeatable regression exercise
Attach a listener to a button in a disposable page, replace its parent markup, and compare click behavior. Repair using a stable ancestor with delegated events or explicit reattachment after rendering.

## SQL: unsafe string building

### Broken example — DO NOT USE

```text
query = "SELECT * FROM users WHERE name = '" + user + "'"
```

### Fixed example

```text
cursor.execute("SELECT * FROM users WHERE name = ?", (user,))
```

### Why it fails and the repair works

Parameter binding stops user text being treated as SQL commands.

### Executable SQLite exercise
SQL assembled from untrusted text can change query meaning. Binding parameters keeps data values separate from SQL syntax. Use an in-memory database so the exercise never touches production data.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE people (name TEXT PRIMARY KEY)")
db.executemany("INSERT INTO people VALUES (?)", [("Ada",), ("Grace",)])
def find(name):
    return db.execute("SELECT name FROM people WHERE name = ?", (name,)).fetchall()
assert find("Ada") == [("Ada",)]
assert find("Ada'") == []
assert db.execute("SELECT COUNT(*) FROM people").fetchone() == (2,)
db.close()
~~~

Save as `query_lab.py` and run `python3 query_lab.py`. The quote inside the second search must be handled as data, not as part of the SQL statement. The trailing comma in `(name,)` creates a one-item tuple. SQLite uses `?` placeholders; other drivers may use different syntax. Parameter binding does not work for identifiers such as table names or sort directions: choose those from a fixed allowlist.

## Bash: unquoted path

### Broken example — DO NOT USE

```text
cd $PROJECT_ROOT
```

### Fixed example

```text
cd -- "$PROJECT_ROOT"
```

### Why it fails and the repair works

Quoting protects paths containing spaces or wildcard characters.

### Reproducible Bash path test
Without quotes, parameter expansion can undergo word splitting and wildcard expansion. A directory containing spaces is passed as several arguments. Quoting preserves a single argument; `--` stops option parsing in commands that support it.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
tmp=$(mktemp -d)
PROJECT_ROOT="$tmp/project alpha"
mkdir -- "$PROJECT_ROOT"
trap 'rmdir -- "$PROJECT_ROOT"; rmdir -- "$tmp"' EXIT
set -- $PROJECT_ROOT
[[ $# -gt 1 ]]  # The broken expansion split into words.
set -- "$PROJECT_ROOT"
[[ $# -eq 1 ]]  # Correct: one argument.
cd -- "$PROJECT_ROOT"
[[ $PWD == "$PROJECT_ROOT" ]]
printf 'Quoted path works: %s\n' "$PWD"
~~~

Run `bash path_lab.sh`. Only the argument demonstration is intentionally unquoted; the filesystem operations use the repaired form. For passing all script arguments onward, use `"$@"`, not `"$*"`. Quotes do not validate a path or make destructive operations safe; validate target directories independently.
