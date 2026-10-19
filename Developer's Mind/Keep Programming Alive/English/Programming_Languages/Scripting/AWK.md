# awk — consolidated language guide

## AWK

### How the language behaves
AWK scans records and fields in a stream; $0 is the entire record and $1 is the first field under the current separator.

### Source fragment to analyze
```text
printf 'A 3\nB 4\n' | awk '{sum += $2} END {print sum}'
```

### Deliberate exercise
Confirm the sum of seven, then switch to comma-separated data with an explicit -F ',' and compare field parsing.

### Check a failure condition
Whitespace splitting is not a CSV parser; quoted commas and embedded newlines need a proper CSV-aware tool.

Record input, expected output and observed output with the actual AWK implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## AWK — Expanded practice workbook

### The right use case
AWK reads records and fields without a Python dependency. Use it for simple local text streams where the input delimiter and schema are known. Do not call a TSV parser a CSV parser: quoted commas and multiline values require different rules.

### Lab setup
Save the program as report.awk. Create sample.tsv with an actual tab between columns: header team TAB points; then red TAB 6, blue TAB 5, red TAB 4. Run awk -f report.awk sample.tsv | sort. Expected sorted lines: blue TAB 5 and red TAB 10.

~~~awk
BEGIN { FS = "\t"; bad = 0 }
NR == 1 {
    if ($1 != "team" || $2 != "points") bad = 1
    next
}
NF != 2 || $1 == "" || $2 !~ /^[0-9]+$/ { bad = 1; next }
{ totals[$1] += $2; seen[$1]++ }
END {
    if (bad) { print "invalid TSV" > "/dev/stderr"; exit 2 }
    for (team in totals) print team "\t" totals[team]
}
~~~

### Understand the order
BEGIN runs before records, NR==1 checks the header, and END prints totals. Associative-array order is unspecified, so sort the output for deterministic comparison; avoid claiming AWK will print insertion order. NF counts fields, and a nonnegative integer regex stops accidental numeric coercion from text like 4x.

### Test boundary conditions
Introduce a row with a missing field, a negative score, a second header, a blank team and an extra tab. The command should produce invalid TSV and exit with status 2; when piped into sort, a shell without pipefail may conceal that exit status. For safe automation use a temporary file for the result or an environment that propagates pipe failure.

### Portability notes
Most POSIX awk implementations support the constructs here. The /dev/stderr pseudo-path is common on Linux/Termux but not guaranteed everywhere; for strict portability replace it with a stdout diagnostic or route through a configured file descriptor. GNU gawk-specific extensions should be documented separately.
Success: two totals, malformed input rejected. https://www.gnu.org/software/gawk/manual/

## AWK — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `awk -f {file} demo.csv`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## AWK — Focused mastery pathway

### Understand the mechanism
AWK processes input one record at a time. FS defines the field separator and NR counts records, including the header. Associative arrays accumulate totals by team, but their iteration order is undefined. Before doing arithmetic, reject malformed records; automatic number coercion can disguise a bad value as zero. Sorting belongs after aggregation, at the output boundary.

### Executable fixture
~~~awk
BEGIN { FS="\t"; OFS="\t" }
NR == 1 { if ($1 != "team" || $2 != "points") { bad=1; exit 2 } next }
NF != 2 || $1 == "" || $2 !~ /^[0-9]+$/ { bad=1; next }
{ total[$1]+=$2 }
END {
  if (NR == 0 || bad) exit 3
  for (team in total) print team,total[team]
}
~~~

### Run and interpret
Create `scores.tsv` containing the TSV rows `team,points`, `red,4`, `blue,2`, `red,3` (commas here represent actual TABs). Run `awk -f sum.awk scores.tsv | sort`. Expect `blue<TAB>2` and `red<TAB>7`. Test a nonnumeric score and check AWK's own exit code; piping into `sort` can hide errors unless `pipefail` is enabled.

### Independent laboratory
Add rejection of negative scores and empty team names. Permute the input order: totals should remain the same. Test an empty file, an incorrect header, and a last record without newline. Explain why sorting the input is not the same as sorting associative-array keys.

## AWK — Technical notes and common pitfalls

### Core knowledge

1. AWK processes records and fields, commonly one input line at a time.
2. BEGIN and END describe setup and completion actions; field separators determine parsing.
3. Output field order and numeric coercion need explicit tests on malformed input.
