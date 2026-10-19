# Path failures: distinguish cwd, quoting, symlinks and case

## Cause and symptoms
No such file or directory can arise even when a file exists somewhere else: relative paths are resolved from the process's current working directory, not necessarily from a script's location. Spaces and wildcard characters can be misinterpreted by a shell. Android shared-storage shortcuts also differ from paths inside $HOME.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
pwd -P
mkdir -p "$HOME/path-lab/sub folder"
printf 'ok\n' > "$HOME/path-lab/sub folder/sample.txt"
ls -l "$HOME/path-lab/sub folder/sample.txt"
cd "$HOME/path-lab"
printf 'Current directory: %s\n' "$PWD"
cat "sub folder/sample.txt"
# Script-relative paths in Bash can use dirname of BASH_SOURCE[0].
~~~

## Evidence-based repair
Before replacing paths, print the absolute resolved path and verify each parent with ls -ld. Quote every shell variable containing a path. Avoid relying on ~ expansion inside quotes: "$HOME/file" is explicit. For Python use pathlib.Path(__file__).resolve().parent for script-relative resources and Path.cwd() for user-selected working-directory resources.

## Hands-on lab
Run the same script from its own directory and from $HOME. Compare relative and script-relative opens. Rename one file with different capitalization and test on your current filesystem; do not assume case-insensitive behavior.
