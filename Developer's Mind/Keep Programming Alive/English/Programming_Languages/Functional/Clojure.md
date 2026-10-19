# Clojure — functional programming guide

## Clojure

### Operational idea
Clojure emphasizes persistent data structures, pure transformations and controlled identity/state on the JVM.

### Source or deliberately marked concept
```text
(reduce + [1 2 3 4])
```

### Apply it to one controlled task
Compare map and reduce, then verify that calling conj returns a new collection instead of mutating the old one.

### Check the important boundary
Laziness can delay computation; never put required irreversible side effects into a sequence expecting eager execution.

Work with disposable data in a genuine implementation of Clojure where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Clojure — Expanded practice workbook

### Trace a sequence transformation
Clojure's collection operators return values without mutating the source persistent vector. In a scratch REPL or `.clj` file, evaluate:

~~~clojure
(require '[clojure.string :as str])
(def names [" Ada " "ada" "Lin"])
(def counts (frequencies (map (comp str/lower-case str/trim) names)))
(println counts)
(assert (= {"ada" 2, "lin" 1} counts))
~~~

The expected map holds Ada twice and Lin once. `comp` composes normalization functions, `map` transforms each element lazily and `frequencies` reduces those values into a map. A map's printing order is not guaranteed; compare key-value associations, not the apparent textual order of braces.

### Probe invalid data deliberately
Add `nil` to `names` and examine whether `str/trim` accepts it. The pipeline does not enforce a string-only schema merely because the original fixture had strings. Decide whether an import must reject nil, omit it, or substitute an explicit marker; use a guard before the transformation rather than converting all unexpected values silently.

### Distinguish reassignment from immutable updates
Evaluate `(assoc counts "lin" 3)` and confirm that it produces a new map while `counts` still associates `"lin"` with 1. If you redefine a top-level Var with `def`, that changes what the Var points to; it does not mutate the underlying persistent map. This distinction matters when designing concurrent workflows.

### Follow-up lab
Introduce case-sensitive and case-insensitive comparison side by side, then use `(get counts "missing" 0)` to express an explicit default. Contrast that with a missing key returning nil. Test empty input and duplicate names. Explain why lazy transformations may defer exceptions until reduction. Capture the exact Clojure and JVM versions; the snippet has not been executed here. References: https://clojure.org/guides/learn/sequences and https://clojure.github.io/clojure/clojure.core-api.html

## Clojure — Focused mastery pathway

### Applied exercises

1. Compose two pure functions and explain their types.
2. Transform a list with map/filter/fold or corresponding primitives.
3. Compare immutable state transformations with hidden mutation.

- How are side effects and mutability represented?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
