# perl — consolidated language guide

## Perl

### Mental model
Perl has scalar, array and hash contexts with rich text processing tools; evaluation context can change an expression's result.

### Minimal source sample
```text
my @values = (1, 2, 3);
print scalar(@values), "\n";
```

### Experiment to carry out
Explain why scalar(@values) counts elements and compare it with joining the array into a string.

### A specific failure to distinguish
Regular expressions need bounded, explicit input assumptions; do not mistake a text match for full input validation.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Perl environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Perl — Expanded practice workbook

### Read the baseline source
~~~text
use strict;
use warnings;
sub greet { my ($name) = @_; return "Hello, $name!"; }
print greet("Ada"), "\n";
~~~

**Relevant environment:** perl hello.pl.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Read UTF-8 lines with a lexical filehandle, count matches using a compiled regex and validate failed open() paths. Compare captures with noncapturing groups.

### The failure that must be understood
Perl scalar versus list context changes results, and input encoding must be explicit. Avoid slurping arbitrary large files and executing untrusted text.

## Perl — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `perl {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Perl — Focused mastery pathway

### Understand the mechanism
`use strict` requires deliberate variable declarations and `use warnings` helps reveal suspicious operations. A hash counts occurrences efficiently, but hash iteration order is not a stable display order. Sort the keys before printing results. Never use `eval` to parse text input. Keep parsing separate from aggregation so empty tokens and mixed-case words have an explicit policy.

### Executable fixture
~~~perl
use strict;
use warnings;
my @words = qw(alpha beta alpha);
my %counts;
for my $word (@words) { $counts{$word}++ }
for my $word (sort keys %counts) {
    print "$word\t$counts{$word}\n";
}
die "bad count\n" unless $counts{alpha} == 2 && $counts{beta} == 1;
~~~

### Run and interpret
Save as `counts.pl`; run `perl -c counts.pl` then `perl counts.pl`. The first checks syntax only. The second must print `alpha<TAB>2`, `beta<TAB>1` in that order and exit successfully. A misspelled variable under `strict` should be caught before execution. Avoid interpreting a syntax-check success as proof that the frequency counts are correct.

### Independent laboratory
Read words from STDIN instead of the hard-coded array. Add a rule for blank lines, keep `Alpha` distinct from `alpha`, and decide whether to strip trailing whitespace. Write tests for empty input, repeated values and reordered input. Use sorted keys to make golden-file comparisons stable.

## Perl — Technical notes and common pitfalls

### Core knowledge

1. Scalars, arrays and hashes have distinct sigils and context-sensitive behavior.
2. A regex is not a general-purpose parser for arbitrarily nested structures.
3. Enable strict and warnings in maintainable scripts and validate decoded input.
