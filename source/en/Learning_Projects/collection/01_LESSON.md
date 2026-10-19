# Five beginner projects: CLI, SQLite, inventories and files

Use Python 3.10 or later and an empty practice directory. Each script is independent: it is not a DedSec installer. Paths below are relative to this guide. The supplied programs demonstrate a starting behavior; suggested extensions are not claims that those features already exist. Keep outputs in a disposable directory and inspect the source before choosing a destination.

## JSON to-do list: stable IDs and persistence

Open [todo.py](../01_todo_cli/todo.py). From the script's directory, try:
~~~sh
python todo.py --db practice.json add "Study Python"
python todo.py --db practice.json add "Read about queues"
python todo.py --db practice.json done 1
python todo.py --db practice.json list
~~~
Expected: IDs 1 and 2 remain distinct; only task 1 displays `[x]`. Running list again after closing the shell should read the same JSON file. Using a relative `--db` path from a different working directory selects a different file, so resolve the destination deliberately.

The program writes a temporary sibling and replaces the destination. This reduces the chance of leaving partially written JSON at the final path, but its fixed temporary name is not a concurrency lock and it does not provide a power-loss durability guarantee. Two simultaneous writers can overwrite each other's changes. Keep this exercise single-process. A later multiwriter design needs coordination or a transactional store.

Test `done 999` and an empty title: both should fail without changing a valid database. Then put invalid JSON in a separate fixture. The reader should report an error rather than silently replace that file with an empty list. Extension: validate every loaded record's id, title and done field, then add tests for duplicate IDs and wrong types. Do not implement recovery by destroying an unreadable original.

## SQLite notes: parameters, ordering and a real reopen

Open [notes.py](../03_sqlite_notes/notes.py). Its actual schema uses a column named `text`, not `body`. It creates the table if needed and prints rows ordered by ID.
~~~sh
python notes.py --db practice.sqlite3 add "It's a note"
python notes.py --db practice.sqlite3 add "Δοκιμή"
python notes.py --db practice.sqlite3 list
~~~
Expected: the quote is stored as data, Greek text survives, and two rows appear in insertion-ID order. Run list in a fresh process to verify persistence. The question-mark placeholder binds a value; string interpolation into SQL would instead mix user data with SQL syntax.

The current NOT NULL constraint rejects null but permits an empty string. Proposed extension: reject whitespace-only text before insertion and add a database CHECK if that is the intended invariant for all writers. Test a quote-containing string, Unicode, empty input and a second connection after commit. A small read-only count query is `SELECT COUNT(*) FROM notes`; it counts rows rather than relying on a cursor's rowcount for SELECT. Back up a real database before any schema exercise.

## SHA-256 inventory: one changed byte, one changed digest

Open [hashes.py](../04_sha256_inventory/hashes.py). Create a practice directory containing `alpha.txt` with `abc` and `beta.txt` with `xyz`, then inspect only that directory:
~~~sh
python hashes.py ./practice-files
~~~
Record both digests outside the directory being inventoried. Change only alpha.txt by appending `!` and rerun. Exactly one content digest should change. If the output manifest is saved inside the scanned folder, it becomes another input and can contaminate comparisons; keep reports separate.

Read the implementation to find its chunk size and traversal policy. Hashing incrementally bounds the data buffer, although building a huge path list can still consume memory. An unreadable file, a symlink and a file changing during the read require explicit policy. Extension: return a failure status for incomplete inventories instead of presenting a partial report as complete. A hash can show equality with an expected digest; it does not establish who supplied that expectation.

## ZIP inspection: names and declared sizes before extraction

Open [inspect_zip.py](../06_safe_archive_inspector/inspect_zip.py). First create a small ZIP with readme.txt and sub/data.txt. Inspect it without extracting:
~~~sh
python inspect_zip.py practice.zip
~~~
The scanner should list members and their declared sizes. Make a second synthetic archive containing `../outside.txt` and inspect the report. No file should appear outside the practice directory because inspection does not require extraction. If the supplied version only reports a suspicious entry, extending it to reject that entry is additional work, not a property to assume.

Design tests for a forward-slash absolute path, backslash traversal intended for Windows, duplicate member names, excessive entry counts and an unusually high expanded size. A path that looks safe on Linux may be interpreted differently on another platform. Size metadata is useful for preflight limits, but it is not proof that reading all decompressed bytes will fit a resource budget. Keep both declared and actual limits if implementing extraction.

## Text flashcards: deterministic shuffling is not answer grading

Open [flashcards.py](../07_text_flashcards/flashcards.py). Write a UTF-8 TSV with two columns: term, then definition. Use a tab separator, not the literal characters backslash and t.
~~~sh
python flashcards.py sample.tsv --seed 4
~~~
Press Enter to reveal each definition. This starter script shuffles with a seeded local random generator and reveals answers; it does not grade typed answers, store progress or schedule spaced repetition. With the same deck and runtime, rerunning with the same seed should preserve the order. Different source row order changes the starting input even when the seed is unchanged.

Try an empty deck, one card, a malformed one-column row and a Greek definition. Inspect how rows with fewer than two columns are skipped. Extension: report skipped row numbers so missing material is visible. If adding saved progress later, introduce stable card IDs and keep progress separate from deck text. Verify that editing a question does not transfer another card's statistics to it. These are state-management requirements rather than a call to `len` repeated across unrelated projects.
