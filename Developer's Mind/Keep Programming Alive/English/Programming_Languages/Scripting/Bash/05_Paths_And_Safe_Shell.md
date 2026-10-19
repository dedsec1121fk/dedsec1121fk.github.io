# Shell scripts break when they confuse text with command syntax

## Treat every filename as arbitrary data
A path can contain spaces, asterisks or a leading dash. Unquoted variable expansion can split words and expand globs, silently changing which files a command touches. Always quote substitutions representing a single path. The `--` separator can protect many commands from confusing a filename beginning with `-` for an option.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
root="${1:?provide an existing directory}"
if [[ ! -d "$root" ]]; then
  printf 'not a directory: %s\n' "$root" >&2
  exit 2
fi
root="$(cd -- "$root" && pwd -P)"
find "$root" -maxdepth 1 -type f -print0 |
while IFS= read -r -d '' file; do
  printf 'file: %q\n' "$file"
done
~~~

## Why the NUL delimiter matters
A newline is legal inside a Unix filename, so line-based parsing can be ambiguous. `-print0` and `read -d ''` preserve exact boundaries. Never attempt to fix unusual filenames by running uncontrolled renaming over a user's data. The code above lists paths only; it does not remove or modify them.

## Know the limitations of strict mode
`set -e` behaves differently inside conditionals, pipelines and command substitutions; don't assume it guarantees transaction-like rollback. `pipefail` helps propagate pipeline failures, but a background process still needs explicit waiting and status checks. Use a small test suite with an empty directory, a path containing spaces and a path containing a newline.

## Expected evidence
The same files should be printed exactly once regardless of their names. Record Bash version and host OS; not all shells support `read -d` or the same `[[ ... ]]` syntax. Do not copy a Bash-specific script into generic POSIX sh without reviewing differences.

## Include option-like directory arguments in the test
Quoting preserves one argument but does not stop a program from interpreting a leading dash as an option. The `find` starting point in this lesson is normalized below to an absolute directory, so a caller can supply a directory whose name begins with `-`. The `--` used by `cd` belongs to Bash's builtin; support for that marker must be checked separately for other tools.

For a bounded exercise, create an empty temporary directory with files named `two words.txt`, `star*.txt` and a filename containing a newline. The output is shell-escaped presentation from `%q`, not a reversible line-based interchange format unless it is parsed with the same Bash rules. Do not feed that display back into `eval`. If another program consumes the result, retain NUL delimiters instead.

## A pipeline is not a transaction
If a consumer exits early, an upstream producer may fail with SIGPIPE. With pipefail, that can make the whole pipeline fail even though the intended first result was consumed. Check the status that corresponds to your contract rather than adding `|| true` everywhere. Files already written before a later error remain written. Temporary output plus a deliberate final rename is a separate design, not a feature supplied by `set -e`.

Reference: [Bash word splitting](https://www.gnu.org/s/bash/manual/html_node/Word-Splitting.html).
## Pipeline status and deliberate error handling

A pipeline normally reports the exit status of its last command. An earlier stage can fail while the final formatter exits successfully. Bash pipefail changes the pipeline status, but it does not replace a decision about which statuses are expected. Tools such as grep use distinct codes for “no match” and a real error, so a blanket failure policy can reject valid empty results.

The local fixture uses a deliberately failing producer and a successful consumer. It examines status directly instead of treating set -e as a complete exception system. Be especially explicit around conditionals, subshells and cleanup traps.

```bash
set -u
set +o pipefail
(exit 7) | cat >/dev/null
normal=$?
set -o pipefail
(exit 7) | cat >/dev/null
strict=$?
[[ "$normal" == 0 && "$strict" == 7 ]] || exit 1
printf 'pipeline statuses: %s %s\n' "$normal" "$strict"
```

Test an empty search result separately from an unreadable input file. Save a status immediately before another command overwrites it. For filenames read from a process, retain NUL separation where supported; newline-delimited paths are ambiguous when a filename itself contains a newline.

[Technical reference](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html)
