# Bash: unbound variable under nounset

**Environment:** Bash scripts using `set -u` or `set -o nounset`.

## Understand the failing expansion
With nounset enabled, expanding an unset parameter is an error. This can reveal misspelled configuration names, missing environment variables or ordering bugs early. An empty but **set** variable is not the same as an unset variable, so a blindly supplied default can hide missing required input.

## Reproduce without changing files
~~~bash
bash -c 'set -u; printf "%s\n" "$MISSING_VALUE"'
~~~
**Expected behavior:** a nonzero exit and a diagnostic mentioning `MISSING_VALUE: unbound variable`; wording depends on Bash version. Now handle a genuinely optional value:
~~~bash
bash -c 'set -u; printf "%s\n" "${MISSING_VALUE:-guest}"'
~~~
**Expected output:** `guest`.

## Pick the right contract
For an optional setting, `${name:-fallback}` substitutes when the name is unset **or empty**. `${name-fallback}` substitutes only when it is unset. For required settings, `: "${TOKEN:?TOKEN is required}"` aborts with a clear message, but avoid printing the token. To detect whether a variable exists without expanding its secret content, use `[[ -v TOKEN ]]` in Bash.

## Debugging path
1. Locate the **first** expansion named in the error, not the line that happens to call the script.
2. Inspect how values are passed: positional arguments, environment inheritance and configuration file sourcing. Child processes only inherit variables exported into their environment.
3. Check spelling and case; `API_KEY` and `api_key` differ.
4. Decide whether the parameter must exist or can have a default. Explicitly initialize local variables in each function.
5. Test unset, empty, whitespace-only and valid values separately.

## Portability warning
These examples invoke **Bash** intentionally. Termux may have Bash installed, but scripts launched by `sh script.sh` may run a different shell. Use an appropriate shebang or invoke `bash script.sh` when relying on Bash-only `[[ -v ]]`. Do not disable `set -u` globally to suppress one faulty expansion.
