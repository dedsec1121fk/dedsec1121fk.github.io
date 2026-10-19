# fish — consolidated language guide

## Fish

### How the language behaves
Fish is an interactive shell with its own syntax for conditionals, loops and variables; Bash scripts are not generally interchangeable.

### Source fragment to analyze
```text
set count 2
math $count + 3
```

### Deliberate exercise
Check numeric output, then examine how Fish represents lists and how quoted variable expansion differs from Bash.

### Check a failure condition
A Bash-style VAR=value prefix or [[ condition ]] may be invalid in Fish; choose the correct shell explicitly.

Record input, expected output and observed output with the actual Fish implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Fish — Expanded practice workbook

### Read the baseline source
~~~text
function greet
  echo "Hello, $argv[1]!"
end
greet Ada
~~~

**Relevant environment:** fish hello.fish.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Write a function that counts matching filenames safely using argument arrays. Compare Fish list expansion with Bash word splitting and test paths containing spaces.

### The failure that must be understood
Fish syntax for set, if and command substitutions is not POSIX sh; do not execute a Bash script with fish as its interpreter.

## Fish — Focused mastery pathway

### Foundation exercise
Write a Fish function accepting a list of filenames and printing quoted filenames safely, including paths with spaces.

### Problem-solving exercise
Compare Fish arrays, set and command substitutions with POSIX sh. Test a glob with zero matches under the shell's installed version and options.

### Independent project
Implement a Fish read-only project search with a fixed root and user-supplied literal term. Preserve spaces in arguments and report no matches without using eval.
