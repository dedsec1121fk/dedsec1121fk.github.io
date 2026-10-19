# Permission denied: interpreter, execute bit and Android filesystem

## Cause and symptoms
A command can return Permission denied because the file lacks execute permission, a parent directory cannot be traversed, the shebang points to an unavailable interpreter, or the filesystem refuses direct execution. In Termux, private $HOME and Android shared storage behave differently. chmod alone cannot bypass a noexec mount.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
mkdir -p "$HOME/termux-exec-lab"
cd "$HOME/termux-exec-lab"
printf '#!/data/data/com.termux/files/usr/bin/sh\nprintf "worked\\n"\n' > hello.sh
ls -l hello.sh
sh hello.sh
chmod u+x hello.sh
./hello.sh
# For a portable interpreter path, inspect: command -v sh
~~~

## Evidence-based repair
Inspect the exact error and use ls -l, ls -ld on parent directories and the path selected by command -v. Prefer an executable script in $HOME; for scripts on shared storage, call the interpreter explicitly or copy the file into a supported location. A shell script can still fail on CRLF despite +x. Never recursively chmod 777 a home directory as a repair.

## Hands-on lab
Create one file without the execute bit and another with a wrong shebang. Compare running ./script with sh script and record the distinct errors. Test only in a disposable folder; leave original project permissions unchanged.

## Verification
Retain environment details, first failure, minimal correction and regression result. A repair is demonstrated only when the original failure no longer reproduces.
