# clojurescript — consolidated language guide

## ClojureScript

### How the language behaves
ClojureScript compiles Lisp-style immutable data operations to JavaScript and offers persistent collections in browser applications.

### Source fragment to analyze
```text
(def values [1 2 3])
(map inc values)
```

### Deliberate exercise
Inspect the new lazy sequence and test whether the original vector has been mutated. Contrast collection semantics with a JavaScript array.

### Check a failure condition
A lazy sequence can hide deferred computation and cannot be used as a guarantee that side effects already ran.

Record input, expected output and observed output with the actual ClojureScript implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## ClojureScript: applied exercises

### A compiler-targeted vector example
ClojureScript emits JavaScript for browser and Node.js targets; it is not interchangeable with a Clojure JVM process. In a disposable namespace:

~~~clojure
(ns practice.core)
(defn square [n] (* n n))
(def input [1 2 3])
(def output (mapv square input))
(assert (= [1 4 9] output))
(js/console.log (clj->js output))
~~~

Expected numeric elements are 1, 4, 9. `mapv` returns a persistent vector with the transformed values; it does not mutate `input`. Confirm the emitted result with a properly configured ClojureScript build and JavaScript host, recording both compiler and runtime versions. The observed output formatting can depend on the host.

### Use equality according to data semantics
Compare `(= [1 2] [1 2])` with reference identity checks. In ClojureScript, value-oriented comparison of persistent structures is different from JavaScript object identity. If you convert to a JavaScript array with `clj->js`, explain that native arrays have different comparison semantics and should not be assumed interchangeable with persistent vectors.

### A surprising invalid input
Try `(square "bad")` in a throwaway run and record the actual behavior; JavaScript numeric coercion and emitted operators may produce results different from a static type-checking error. Before multiplying imported JSON values, explicitly require `number?` and any domain bounds. Explain whether invalid data is rejected, returned as a tagged error or omitted.

### Independent browser exercise
Pass a small vector of filtered scores from ClojureScript into a DOM text node using a safe text API, not by assigning untrusted HTML. Test empty vector, duplicate values, Unicode labels and a missing element. Do not claim JVM test results establish browser behavior; capture the compiled target and a browser regression separately. Reference: https://clojurescript.org/

## ClojureScript — Focused mastery pathway

### Applied exercises

1. Build a tiny accessible form with a descriptive label and error message.
2. Model one request and response using the platform HTTP API or simulator.
3. Reject invalid input and encode user-supplied text before inserting into HTML.

- Where does user-controlled input cross a trust boundary?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
