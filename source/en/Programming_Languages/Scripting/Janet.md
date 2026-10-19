# janet — consolidated language guide

## Janet

### How the language behaves
Janet is a small Lisp-like embeddable language with tables, arrays and a compact runtime suited to scripting.

### Source fragment to analyze
```text
(def nums @[1 2 3])
(print (length nums))
```

### Deliberate exercise
Distinguish mutable array syntax from other collection forms, then change one element and compare the original contents.

### Check a failure condition
Macros expand source expressions and are not ordinary functions; verify evaluation rules before introducing mutation.

Record input, expected output and observed output with the actual Janet implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Janet — Expanded practice workbook

### Read the baseline source
~~~text
(defn greet [name] (string "Hello, " name "!"))
(print (greet "Ada"))
~~~

**Relevant environment:** janet hello.janet.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Map a function over an array and reduce it to a total while tracing mutable versus immutable collection operations. Compare a table with a struct as an API contract.

### The failure that must be understood
Janet macros and fibers use language-specific evaluation rules; do not assume Clojure forms or Common Lisp packages port directly.

## Janet — Focused mastery pathway

### Foundation exercise
Build an immutable struct of key/value settings and compare it with a mutable table, including lookup of an absent key.

### Problem-solving exercise
Compose a filtering function over an array and test nonnumeric input before reduction; examine macro expansion only after the ordinary function is correct.

### Independent project
Make a small script accepting records and returning counts with explicit errors. Use fibers for a controlled suspension experiment and document scheduling assumptions.
