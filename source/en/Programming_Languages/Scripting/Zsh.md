# zsh — consolidated language guide

## Zsh

### How the language behaves
Zsh offers powerful interactive expansion, globbing and shell scripting, with differences from Bash in arrays and option behavior.

### Source fragment to analyze
```text
array=(red green blue)
print $array[1]
```

### Deliberate exercise
Compare its one-based array indexing with Bash's default indexing and test a missing element explicitly.

### Check a failure condition
Globbing with no matches and word splitting can differ by configured options; record the active shell settings.

Record input, expected output and observed output with the actual Zsh implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Zsh — Expanded practice workbook

### Read the baseline source
~~~text
greet() { print -r -- "Hello, $1!" }
greet Ada
~~~

**Relevant environment:** zsh hello.zsh.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Write a function to list paths safely using Zsh arrays and glob qualifiers; compare null_glob behavior and handle no matches without deleting anything.

### The failure that must be understood
Zsh globbing options differ from Bash; a pattern with zero matches can error. Quote interpolations and record enabled shell options.

## Zsh — Focused mastery pathway

### Inspect the language's real model
Write a Zsh function using an indexed array of paths and demonstrate how quoting preserves filenames with spaces.

### Controlled failure and recovery
Compare unmatched glob behavior with and without null_glob for the installed Zsh options. Record a deliberate no-match result rather than silently acting on the wrong file.

### Independent practical assignment
Create a read-only backup manifest listing candidate files, rejecting directories you did not authorize. Include filenames with wildcard characters and avoid eval or unsafe recursive deletion.
