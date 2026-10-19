# raku — consolidated language guide

## Raku

### How the language behaves
Raku provides rich grammars, signatures and gradual typing; its syntax diverged substantially from Perl despite historical ties.

### Source fragment to analyze
```text
my @items = 2, 4, 6;
say [+] @items;
```

### Deliberate exercise
Trace the reduction operator and compare a list of numeric inputs with one containing an invalid string.

### Check a failure condition
Raku's dynamic coercions and grammar behavior are not Perl compatibility promises; test against the actual compiler.

Record input, expected output and observed output with the actual Raku implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Raku — Expanded practice workbook

### Read the baseline source
~~~text
sub greet(Str $name) { "Hello, $name!" }
say greet('Ada');
~~~

**Relevant environment:** raku hello.raku.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Define a function using signatures with type constraints and process a sequence with map and grep. Compare lazy Seq and eager Array behavior.

### The failure that must be understood
Raku is not simply renamed Perl 5: grammars, junctions and operators have distinct semantics. Check whether a result is a Seq consumed once.

## Raku — Focused mastery pathway

### Inspect the language's real model
Write a Raku function with typed signatures that filters values using grep and transforms them using map.

### Controlled failure and recovery
Compare lazy Seq with eager Array by iterating twice. Identify whether the second use consumes an already-exhausted sequence and test a safe explicit collection conversion.

### Independent practical assignment
Build a small text summarizer using a Raku grammar to validate line structure, reporting which input failed and why. Test one Unicode and one malformed record.
