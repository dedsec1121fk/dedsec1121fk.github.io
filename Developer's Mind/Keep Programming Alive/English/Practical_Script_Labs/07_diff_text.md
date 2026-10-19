# Practical scripts: revision diffs, logs and SQLite tasks

## Compare Two Text Revisions

### How the algorithm works
The changed(old,new,context=3) function in 07_diff_text.py uses difflib.unified_diff to construct a patch-like representation. The source and destination are text strings, and splitlines(keepends=True) preserves line terminators used in the comparison. A unified diff shows removed lines with a minus marker and new lines with a plus marker, with unchanged context around them.

### Run the assertions
Execute python 07_diff_text.py. It checks replacing the line two with three, an identical input that produces an empty diff, a Unicode Greek addition, and a zero-context diff. Boolean context values are rejected even though bool is a Python integer subclass. Expected message: unified diff checks passed.

### Lab: semantic behavior versus textual changes
Build two versions of a small configuration file. Make a whitespace-only change, rename an identifier, then change a numeric threshold. Observe that line diffs reveal bytes and line context but cannot prove runtime equivalence. For source code changes, pair the diff with unit tests. For large text, consider files that end without a newline and inspect the diff presentation carefully.

### Practical limits
This function does not apply patches, preserve binary content, or perform a three-way merge. It does not guarantee Git-compatible hunk semantics for every unusual newline case. Work with decoded UTF-8 text and inspect encodings before comparing files. Source: 07_diff_text.py. Reference: https://docs.python.org/3/library/difflib.html

## Analyze Structured Log Events

### Accept a narrow event schema
09_log_events.py reads JSON values one physical line at a time. Each accepted row needs a severity from INFO, WARN or ERROR, a timezone-aware ISO 8601 timestamp and a string message. It emits line number, normalized timestamp, severity and a message shortened to 120 characters. Other object properties, including a separate token field, are not forwarded.

### Run the concrete checks
Execute python 09_log_events.py. The sample includes a valid UTC event, an event without timezone and malformed JSON. The latter two produce a generic invalid log line record. The test confirms that an extra token field is not included in the output. Expected result: log event validation checks passed.

### Security caveat: do not overclaim redaction
The parser does not automatically detect passwords or private values embedded inside the message field. Truncation is not redaction. Only feed non-sensitive messages into the example or sanitize at the producer before collecting. A production logging pipeline also needs strict access controls, retention policy, bounded buffers and monitoring for parsing failures.

### Investigate event chronology
Feed two valid events out of order and compare their original line numbers with parsed timestamps; arrival order need not equal event-time order. Add a test for a timestamp with an explicit +03:00 offset and another for an impossible date. Choose how to report invalid rows without leaking their original contents. Working source: 09_log_events.py. Reference: https://docs.python.org/3/library/datetime.html

## Use Transactions for SQLite Tasks

### What the runnable lab does
The companion script 10_sqlite_tasks.py creates a temporary on-disk SQLite database, defines a task table with NOT NULL, UNIQUE and CHECK constraints, and inserts a title containing an apostrophe using a bound SQL parameter. It updates the task in the same transaction, then starts another transaction that deliberately violates CHECK(done IN (0,1)). This should roll back both the invalid row and the earlier Temporary insert from that transaction.

### Run and verify persistence
Execute python 10_sqlite_tasks.py. The program expects exactly one committed task, Learner's task with done=1. It then closes and reopens the database and verifies the committed task remains while Temporary does not. The test runs only in TemporaryDirectory and does not touch the user's existing databases. Expected message is SQLite transaction and rollback checks passed.

### The boundaries that matter
Connection context managers commit successful transactions and roll back failed ones, but they do not necessarily close the connection; the script uses closing explicitly. SQL parameters represent values rather than executable SQL syntax. They cannot parameterize identifiers such as table names. CHECK is a database invariant, not a user-interface validation substitute.

### Extend the lab
Add a second valid task and a delete operation, then simulate a failure before commit and verify both operations roll back atomically. Implement migrations for a new due_date column in a separate scratch database. Explore concurrent writes and SQLITE_BUSY without disabling safety constraints. Source: 10_sqlite_tasks.py. Reference: https://docs.python.org/3/library/sqlite3.html
