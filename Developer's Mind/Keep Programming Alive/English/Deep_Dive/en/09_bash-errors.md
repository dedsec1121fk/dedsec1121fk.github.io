# Defensive Bash scripts and exit codes

## What is happening
Bash exit status 0 means success by convention; a failing command in a pipeline may be missed without explicit handling.

## Practical investigation
Quote variables holding paths, distinguish unset variables from empty values and use temporary files with cleanup traps for updates.

## Common traps
Avoid blindly executing remote curl output. Download from a trusted source, read it, verify a signed release and only then run it.

## Adaptable demonstration
```text
bash -n ./script.sh
```

## Capture failure before another command overwrites it
~~~bash
if grep -q 'needle' ./fixture.txt; then
  printf '%s\n' 'found'
else
  status=$?
  if [ "$status" -eq 1 ]; then
    printf '%s\n' 'not found'
  else
    printf 'read/search failed: %s\n' "$status" >&2
    exit "$status"
  fi
fi
~~~
Create one fixture containing needle, one without it, then pass a missing path. Grep status 1 means no match, while an error needs a distinct response. Capturing `$?` after a logging command instead would record the logger's status. This is why `if command` is often clearer than relying on set -e.

`bash -n` parses shell syntax but does not prove that files exist, quoting is correct for actual data or commands succeed. Add explicit fixtures with whitespace and a leading dash. A cleanup trap should remove only the temporary path created by this invocation, including when an interrupt arrives; it must never use an empty or unvalidated variable as a deletion target.
