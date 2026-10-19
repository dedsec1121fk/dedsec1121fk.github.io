# tcl — consolidated language guide

## Tcl

### How the language behaves
Tcl is command-based: whitespace separates words, brackets evaluate commands and braces defer substitution.

### Source fragment to analyze
```text
set a 3
puts [expr {$a * 4}]
```

### Deliberate exercise
Explain why expr is bracketed and how braces protect the arithmetic expression from unintended substitution.

### Check a failure condition
Confusing braces and quotes changes evaluation timing; inspect exact string interpolation before passing untrusted input.

Record input, expected output and observed output with the actual Tcl implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Tcl — Expanded practice workbook

### Read the baseline source
~~~text
proc greet {name} { return "Hello, $name!" }
puts [greet Ada]
~~~

**Relevant environment:** tclsh hello.tcl.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Write a proc that iterates a Tcl list and reports a total. Compare braced expressions and quoted strings to observe substitution and safe list construction.

### The failure that must be understood
Tcl's substitution and evaluation rules differ from shell: eval on user input can turn data into commands. Preserve list semantics instead of splitting strings on spaces.

## Tcl — Focused mastery pathway

### Understand the mechanism
Tcl parses commands into words; braces prevent substitution, brackets perform command substitution, and quoted strings group words while permitting substitution. Tcl lists are not plain space-separated strings. Use `foreach` and the built-in list commands rather than manually splitting strings. Validate a numeric field with `string is integer -strict` before calling `incr`.

### Executable fixture
~~~tcl
proc sum_valid {items} {
    set total 0
    foreach item $items {
        if {![string is integer -strict $item]} { error "not integer" }
        incr total $item
    }
    return $total
}
if {[sum_valid {2 3 5}] != 10} { error "bad sum" }
if {![catch {sum_valid {2 invalid}} msg] || $msg ne "not integer"} {
    error "invalid input accepted"
}
puts "all checks passed"
~~~

### Run and interpret
Save as `sum.tcl` and run `tclsh sum.tcl`; expect `all checks passed`. The `catch` call converts an expected error into a result the test can examine; it must not swallow unrelated failures. When testing an API, use structured error codes instead of relying on language-specific diagnostic text. Record `info patchlevel` for version-specific observations.

### Independent laboratory
Create a two-field record with `list` containing a team name with spaces and an integer value. Iterate over records without corrupting the grouped name. Add a negative-value policy and test empty input, a singleton list, invalid numeric text and a zero score. Compare `catch` exit outcomes for each case.
