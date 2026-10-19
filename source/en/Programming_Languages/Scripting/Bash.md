# bash — consolidated language guide

## Bash

**Typical use:** Automation and shell scripting.

**Suggested file extension:** `.sh`.

**How to run / environment:** bash hello.sh.

### Starter example

```
#!/usr/bin/env bash
set -euo pipefail
greet() { printf 'Hello, %s!\n' "$1"; }
greet 'Ada'
```

### How to read it

Quote shell variables to prevent unwanted splitting.

### Common pitfall

Quote shell variables to prevent unwanted splitting. 

### Scripts that handle paths safely
Shell scripts are primarily process orchestration, not general-purpose data parsers. Quote expansions so filenames with spaces are not split: `"$file"` rather than `$file`. Use arrays in Bash when iterating names and keep command options separate from filenames.
```bash
#!/usr/bin/env bash
set -euo pipefail
dir="${1:-.}"
if [[ ! -d "$dir" ]]; then
  printf 'Not a directory: %s\n' "$dir" >&2
  exit 2
fi
while IFS= read -r -d '' file; do
  printf 'Found: %s\n' "$file"
done < <(find "$dir" -maxdepth 1 -type f -print0)
```
`set -e` has contextual exceptions; do not treat it as transactional error handling. Commands in pipelines may exit unexpectedly, so test error branches. Filesystem paths can begin with a dash; use `--` for tools that support it. `find -print0` plus NUL-safe reading handles unusual filenames.

**Exercise:** create files with spaces, quotes and newlines in names in a throwaway directory, run the script, and show that every file appears once. Reference: https://www.gnu.org/software/bash/manual/.

### Bash automation: quotes, errors and paths with spaces

Shell scripts often fail because spaces are split or a command error is ignored. Save this as a script and run it against a temporary folder that YOU created:

~~~bash
#!/usr/bin/env bash
set -euo pipefail
main() {
  if (($# != 1)); then printf 'usage: %s DIR\n' "$0" >&2; return 2; fi
  local root=$1
  [[ -d "$root" ]] || { printf 'not a directory: %s\n' "$root" >&2; return 2; }
  find "$root" -maxdepth 1 -type f -print
}
main "$@"
~~~

Pass a path like “demo folder” as a single quoted argument and inspect the file list. Run with a missing path to confirm it exits with status 2. Compare "$@" with unquoted $@ and "$root" with $root, especially if a filename contains spaces or wildcard characters. The find command prints newline-separated paths; for robust machine pipelines with arbitrary newlines, prefer -print0 with a NUL-aware consumer.

Understand the limitations of set -e: failures inside conditionals, command substitutions and certain pipelines require deliberate status handling. pipefail makes nonzero pipeline stages observable, but it does not replace checks of business logic. For temporary files consider mktemp and a trap that cleans only paths created by your script.

**Pass condition:** spaces are preserved, a missing directory is reported clearly, and no command deletes or writes outside the explicit test folder. Reference: https://www.gnu.org/software/bash/manual/.

## Bash — Expanded practice workbook

### Design the input contract
Count nonempty, noncomment lines in a user-selected text file, including the final line if it has no newline. Never evaluate the file's contents as shell code, and do not modify it.

### Run the script
Save as count.sh and invoke bash count.sh "example file.txt". Create a file with alpha, a line starting #, an empty line, and beta. Output should be useful lines: 2. The path can contain spaces.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
if (( $# != 1 )); then
  printf 'Usage: bash count.sh FILE\n' >&2
  exit 2
fi
file=$1
if [[ ! -f $file || ! -r $file ]]; then
  printf 'File missing or unreadable: %s\n' "$file" >&2
  exit 1
fi
count=0
while IFS= read -r line || [[ -n $line ]]; do
  [[ -z $line || $line == \#* ]] && continue
  ((count+=1))
done < "$file"
printf 'useful lines: %d\n' "$count"
~~~

### Explain the commands
Double-quoted "$file" keeps a pathname as one argument. IFS= read -r preserves whitespace and backslashes. The extra condition after read processes a final unterminated line. The arithmetic expression ((count+=1)) avoids the first-iteration failure of ((count++)) under set -e: a zero-valued arithmetic expression returns an unsuccessful shell status.

### Challenge set
Check an empty file, a directory supplied instead of a file, a nonexistent path, a trailing line without newline, and lines beginning with spaces before #. This version only recognizes # in the first column. To change that decision, write a separate normalization step with tests. Check exit codes with echo $?.

### Platform problems
Run with bash, not sh; [[...]] and pipefail are Bash features. On Termux verify bash and storage permissions. Windows needs a Bash environment; PowerShell is a different shell. CRLF input may contain a literal carriage return at line ends; convert only with an explicit file-format policy.
Success: 2 lines, no mutation, safe paths. https://www.gnu.org/software/bash/manual/

## Bash — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `bash {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Bash — Focused mastery pathway

### Contract and dependencies
On Linux or Termux, list regular files under a selected directory with their relative paths, byte sizes and a deterministic count. Preserve spaces, Greek letters, tabs and embedded newlines in file names. Do not change scanned files or require sudo. This version uses GNU find -print0, sort -z, wc, mktemp and Bash-specific printf %q; it deliberately does not follow symlinks.

### Executable program
Save as inventory.sh. Verify bash -n inventory.sh; create a disposable fixture and invoke bash inventory.sh 'fixture [demo]'. Scratch files are created outside the scanned root and removed after execution.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
[[ $# -eq 1 && -d $1 ]] || { printf 'usage: %s DIRECTORY\n' "$0" >&2; exit 2; }
root=$(cd -- "$1" && pwd -P)
tmp=$(mktemp -d) || exit 1
trap 'rm -rf -- "$tmp"' EXIT
# GNU sort -z and find -print0 preserve whitespace and newlines in file names.
find "$root" -type f -print0 > "$tmp/files"
LC_ALL=C sort -z "$tmp/files" > "$tmp/sorted"
count=0
while IFS= read -r -d '' file; do
  [[ -f $file ]] || { printf 'vanished: %q\n' "$file" >&2; exit 3; }
  bytes=$(wc -c < "$file")
  relative=${file#"$root"/}
  printf '%q\t%d\n' "$relative" "$bytes"
  ((count+=1))
done < "$tmp/sorted"
printf 'COUNT\t%d\n' "$count"
~~~

### Shell-specific reasoning
The expression for f in $(ls) is unsafe: command substitution strips final line breaks, then word splitting and wildcard expansion corrupt filenames. Quoting variables does not fix the earlier splitting. A NUL separator never appears in a pathname, so find -print0, sort -z and read -r -d '' preserve file identities. Bash %q makes even newline-containing paths printable unambiguously. Writing the intermediate list into checked temporary files also exposes find/sort failures.

### Controlled diagnostic labs
1. Create files named 'space name.txt', 'α beta.txt', an empty file and a nested file. Confirm COUNT is four and empty file size is zero.
2. Add one filename with an embedded newline. Compare %q with naive printf %s and explain ambiguous output.
3. Remove a fixture during enumeration or use a permission-restricted directory in an environment that enforces permissions. Record the failure rather than masking it.
4. Run twice with unchanged files; compare sorted output. Use ShellCheck only where it is installed. Check for GNU sort -z before trying other Unix systems.

**Evidence:** a saved transcript, Bash and sort versions, four boundary filenames and an explanation of why NUL-safe parsing matters.

## Bash — Technical notes and common pitfalls

### Core knowledge

1. Quote variable expansions unless intentional word splitting or glob expansion is needed.
2. Use arrays for argument lists; strings containing shell syntax are not safe argument lists.
3. set -e behavior is context-sensitive; explicitly check critical command statuses.
