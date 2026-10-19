# Node.js process exits and port conflicts

## What is happening
EADDRINUSE means another process already listens on the requested address and port; it does not imply a syntax error.

## Practical investigation
List local listeners, verify ownership, then select another port or stop only the process you control. Preserve logs when a server exits without an error.

## Common traps
Catch startup rejections and handle process signals for orderly shutdown. Do not retry binding the same blocked port indefinitely.

## Adaptable demonstration
```text
ss -ltn
```

## Reproduce a bind collision without touching another process
Use a local Node program that creates a server bound to 127.0.0.1 on port 0, letting the OS select an available port. After its listening event, obtain server.address().port and attempt a second listener on that same address and port. The second error should identify EADDRINUSE. Close only those two test server instances during cleanup.

Port 0 is a request for dynamic allocation, not a globally reserved port you should reuse between unrelated runs. Binding 0.0.0.0 listens on all IPv4 interfaces and has a different exposure boundary from localhost. Check the address as well as the port when comparing listeners.

An event-emitting server reports startup failures through its error event; wrapping construction in try/catch alone does not catch a later emitted error. Attach handlers before listen, record the chosen address and handle shutdown once. Exit code zero with no listener can simply mean the program finished its work or never kept an active handle; it is not evidence that an invisible web server remains running.
