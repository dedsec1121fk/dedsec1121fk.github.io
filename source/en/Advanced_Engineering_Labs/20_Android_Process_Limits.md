# A long-running task can stop even if the program is correct

## Identify the kind of termination
Android manages background execution, battery optimization and app lifecycle separately from a traditional Linux server. If a build disappears after the screen locks, do not assume an uncaught Python exception. Record whether the terminal was disconnected, the process received a signal, the phone ran out of memory, or the OS restricted the application. A command killed by the OS might not get an opportunity to write its own error log.

~~~sh
printf 'shell pid: %s\n' "$$"
ps -ef | head -25
printf 'time: '; date -Is
printf 'HOME=%s\n' "$HOME"
~~~

## Prefer checkpointable work
For a multi-hour archive audit, split input into restartable batches and persist a small progress manifest after each *verified* stage. Use atomic file replacement for state files: write a new version in the same directory, flush where necessary, then rename. Never consider the presence of a half-written ZIP evidence that a backup finished. Keep intermediate data inside the app-private workspace and export the completed artifact once validation passes.

## Device settings are a diagnostic variable
Inspect battery restrictions for the Termux application and whether background execution is allowed in the installed Android version. A wake lock, where available through Termux support, concerns device sleep behavior; it is not unlimited permission to ignore Android lifecycle rules. Keeping the app foregrounded can help reproduce a problem but is not a universal stability guarantee.

## Acceptance test
Run a harmless job that writes numbered checkpoints, leave the device idle for a measured interval, and compare the last durable checkpoint with expected progress. Log the Android release, Termux build source and whether the process remained active. Do not disable all device security controls merely to run a test.
## Restartable work survives better than a persistent shell

A wake lock can keep a device awake in some situations, but it does not grant immunity from process termination, vendor restrictions or exhausted memory. Treat a long-running phone task as interruptible. Split work into independently identifiable items and persist acknowledgment only after an item's output is safely recorded.

If work is replayed after a restart, its identifier should prevent a duplicate effect. Merely remembering the last printed progress percentage is insufficient because terminal output and durable output can be at different boundaries. The fixture models repeated delivery with a set of completed item IDs.

```python
completed=set(); effects=[]
for item in ["a","b","a","c","b"]:
    if item in completed: continue
    effects.append(item)
    completed.add(item)
assert effects == ["a","b","c"]
print("replayed items suppressed")
```

This in-memory demonstration is not crash-safe storage. A real implementation must commit the output and acknowledgment together or make output replacement idempotent. Test termination between those two actions on disposable data, and report an interrupted job honestly instead of promising permanent background execution.

[Technical reference](https://github.com/termux/termux-app#installation)
