# v — consolidated language guide

## V

### How the language behaves
V is a compiled systems-oriented language emphasizing simple syntax and explicit handling of many failure cases.

### Source fragment to analyze
```text
fn main() {
    nums := [1, 2, 3]
    println(nums.len)
}
```

### Deliberate exercise
Trace array length, then use an optional-returning function and handle its failure without pretending a value always exists.

### Check a failure condition
Language/compiler revisions may adjust syntax; pin a tested V toolchain for reproducible examples.

Record input, expected output and observed output with the actual V implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## V — Expanded practice workbook

### Read the baseline source
~~~text
fn greet(name string) string { return 'Hello, ${name}!' }
fn main() { println(greet('Ada')) }
~~~

**Relevant environment:** v run hello.v.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Define a struct with a mutable field and a parsing function that returns an error option/result. Test rejected input and compare immutability of normal bindings.

### The failure that must be understood
V language syntax has changed across releases; test with v version, especially option propagation and mut syntax.
