# Five learning paths — programming, web, systems, data and DedSec

## 01 New Programmer

### Phase 1: interpret one program
Read the Foundations lessons on input/output, types, functions and conditions. Before running a five-line Python function, write down the value and type of each variable after every statement. Create three deliberate failures: wrong type, missing dictionary key and invalid numeric range. Explain the exception messages rather than deleting the checks.

### Phase 2: build from scratch
Using the Python workbook and the practical JSON validation lab, write a small offline task tracker. It must load a JSON file, reject unknown keys, add and mark tasks complete, and save the result in a separate output file. Do not overwrite the input while testing. Use a temporary directory, a command-line argument for the filename and explicit UTF-8 encoding.

### Phase 3: test the boundaries
Use unittest or simple assertions for an empty task list, missing file, malformed JSON, a duplicate task identifier and Greek Unicode titles. Add a reproducible failing test before repairing each defect. Run the tests without network access.

### Phase 4: collaborate and maintain
Create a local Git repository, commit an initial state and a small update, then inspect git diff and git log. Separate source, tests and README instructions. Keep a short changelog recording the reason for each behavior change.

### Final assessment
A reviewer should run the program using only the README, see correct output for normal data, get understandable nonzero exit codes on errors and reproduce the five tests. Explain the difference between parsing, validation and persistence without looking at a copied tutorial.

## 02 Web Developer

### Foundation: semantics before decoration
Study HTML landmarks, forms, labels, buttons and links. Build a two-page static site with a real navigation structure. Verify that every interactive element is reachable via keyboard, has visible focus and does not require pointer hover to function.

### JavaScript behavior
Add an on-page search of ten local knowledge records. Treat the query as text; render results using textContent instead of interpreting user-provided HTML. Implement one record per card, keyboard-operable controls and an explicit empty-results message. Keep the dataset in a local JSON file so the page can run offline.

### Asynchronous boundary
Introduce an artificial delayed search Promise and assign a monotonically increasing request ID. Resolve the older request last and prove that its result does not overwrite the newer query. Compare this with debounce, which reduces request volume but does not enforce completion order.

### Browser and deployment tests
Use the Web encyclopedia modules for caching, CORS and browser security. With a local static server, test relative URLs under / and under a subdirectory such as /Test/. Verify light/dark theme contrast and Greek/English UI without duplicated identifiers. Test on a narrow mobile viewport.

### Final assessment
Deliver index.html, one minimal JS module, CSS, local data and a README with offline launch steps. Use DevTools to confirm no missing assets, no uncaught exceptions and no network dependency. Document why CSP, output escaping and server-side authorization are different safeguards.

## 03 Systems Engineer

### Learn the operating environment
Compare a process, thread, file descriptor, environment variable and filesystem permission using the Systems chapters. Record observable differences among Linux, Windows and Android/Termux without assuming that every tool exists on each platform.

### Build a read-only inspector
Create a Python CLI that traverses a user-selected directory, counts regular files by suffix, and reports their sizes and SHA-256 digests. Reject missing roots and print actionable errors. Use pathlib and chunked hashing to avoid reading multi-gigabyte files into memory.

### State the security boundary
Distinguish path normalization from race-free containment. Define how the CLI treats symlinks, unreadable directories, enormous files and paths with Greek letters or spaces. Never follow symbolic links without an explicit policy; document how file changes during hashing affect results.

### Investigate failure conditions
Exercise PermissionError, FileNotFoundError, interrupted reads and subprocess exit statuses in a disposable test tree. Use a safe temporary directory and tests that leave originals unchanged. Avoid chmod 777 and avoid treating a failed command as a reason to disable TLS or access controls.

### Final assessment
Produce a deterministic report sorted by relative path, explicit UTF-8 output and bounded memory behavior. Verify the same functional contract on at least two available platforms, noting platform-specific differences. Supply instructions for Termux as well as desktop users.

## 04 DedSec Maintainer

### Understand the architecture first
Inventory the website, bilingual knowledge records, source archives, build/export utilities and documentation. Draw the flow from a Markdown lesson to the JavaScript data record and finally to the rendered page. Use the test repository as the only target for experiments; do not change production until a separate release decision.

### Make one controlled knowledge change
Choose an existing lesson rather than adding a duplicate page. Improve a specific technical explanation, runnable example and boundary-case check. Update English and Greek as a pair while preserving their existing identity and source path. Check the website loader applies exactly one patch per locale and that the archive mirrors the rendered content.

### Run quality gates
Check duplicate keys, duplicate substantive paragraphs, Markdown fences, missing links, incorrect relative asset paths and empty bilingual records. Verify that the user can search and navigate the changed article in light/dark themes on mobile and desktop. Compare source Markdown with the served page, not only with a generated report.

### Keep deployments and costs controlled
Review the commit diff before pushing to main of Test. Prefer local tests and commits with workflows skipped where appropriate and permitted; never bypass a required quality gate. Document the Git SHA and which validations ran, and distinguish source changes from production deployment.

### Final assessment
Prepare a release checklist with rollback instructions, before/after screenshots, source-to-website parity results and manual browser checks. The release is not ready until no broken links or layout regressions are found.

## 05 Data Analyst

### Establish an explicit data contract
Choose a synthetic transaction dataset with id, date, category and integer cents. State which fields are required, accepted date format, how duplicates are handled and whether negative amounts represent refunds. Do not load personal financial records for practice.

### Clean and validate records
Use csv.DictReader with UTF-8 and newline-aware file opening. Reject extra columns, missing IDs, invalid dates and non-integer cents. Record rejected row numbers and reasons in a separate report, rather than silently dropping malformed records.

### Persist and query
Use an in-memory or disposable SQLite database with NOT NULL, UNIQUE and CHECK constraints. Insert records using bound parameters inside a transaction. Create an aggregation by category and date, then use EXPLAIN QUERY PLAN to compare indexed and unindexed lookups on an adequately sized synthetic dataset.

### Check statistical assumptions
Calculate count, totals, mean and median, explicitly handling an empty group. Demonstrate why a missing amount must not automatically become zero. Compare Decimal-based display formatting with integer cents and state when rounding occurs.

### Final assessment
Provide repeatable commands, input fixtures, expected SQL query results and a rejected-rows report. Verify that duplicate identifiers are handled consistently, the original CSV is never overwritten and the whole report can be rebuilt from scratch.
