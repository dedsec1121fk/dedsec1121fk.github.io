# Termux on Android: diagnose background termination and memory pressure

## What causes the failure
Android may stop background processes because of battery policies, system memory pressure or app lifecycle restrictions. Termux is not exempt from Android process management. A Python process disappearing without a traceback can be killed externally rather than crashing inside Python. Do not assume a reported phone RAM total equals the memory actually available to one process.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
date
cat /proc/meminfo | head -n 8
ps -o pid,ppid,stat,rss,comm -p $$
df -h "$HOME"
# Before a long task, write checkpoints to a safe $HOME file.
# termux-wake-lock may keep CPU awake but cannot guarantee process survival.
~~~

## Repair in evidence-based order
First distinguish process crash, out-of-memory termination, storage exhaustion and battery restriction. Inspect Android battery settings for the app and available system logs where permitted. Break long jobs into resumable stages with atomic checkpoints: write new state to a temporary file, flush and rename. Reduce model size, concurrency and peak allocations on low-memory devices. Avoid holding unnecessary wake locks or disabling system protections globally.

## Hands-on exercise
Run a small script that writes a progress file after every 100 synthetic records, interrupt it manually and restart from the last checkpoint. Verify no duplicate records and that partial writes never overwrite the last valid checkpoint. Measure memory during processing without attempting to trigger a real OOM on your phone.
