# Port already in use: locate the listener and avoid killing unrelated tasks

## Cause and symptoms
An EADDRINUSE error means the requested socket endpoint cannot be bound under the current options. A second copy of your test server may still be running; an IPv4 wildcard listener may also occupy an address needed by a specific bind. A high random test port avoids collisions but does not diagnose the actual owner of a fixed production port.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
# In Termux/Linux, inspect listeners where supported:
ss -ltn
# Optionally:
# lsof -nP -iTCP -sTCP:LISTEN
# For a server you started yourself, stop it with Ctrl+C.
# Never run kill -9 on an unknown PID just because its port matches.
~~~

## Evidence-based repair
Read the bind address, port and process start command, then determine whether the existing listener is expected. Confirm process ownership before any signal. Stop only your own known test process or reconfigure your application to another port. SO_REUSEADDR does not generally allow two unrelated active listeners on the exact same endpoint. Check IPv4 and IPv6 separately.

## Hands-on lab
Start one local Python HTTP server on port 8765, then attempt a second one on that port and record the error. Stop the first known server and verify the second starts. Repeat using an OS-assigned ephemeral port to see why tests should avoid fixed ports.
