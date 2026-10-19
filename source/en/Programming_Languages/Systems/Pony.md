# pony — consolidated language guide

## Pony

### Operational idea
Pony uses actor-based concurrency and reference capabilities to control mutable aliasing.

### Source or deliberately marked concept
```text
actor Main
  new create(env: Env) =>
    env.out.print("Hello Pony")
```

### Apply it to one controlled task
Identify the actor constructor and explain why references shared between actors require capability rules.

### Check the important boundary
An ordinary thread-race fix from another language is not a replacement for Pony's reference capability semantics.

Work with disposable data in a genuine implementation of Pony where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Pony — Expanded practice workbook

### Read the baseline source
~~~text
actor Main
  new create(env: Env) =>
    env.out.print("Hello, Ada!")
~~~

**Relevant environment:** ponyc in a Pony package directory.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Create an actor that receives messages and updates private state; explain how reference capabilities constrain mutable sharing across actors.

### The failure that must be understood
Pony's iso/ref/val capabilities have strong type rules; do not bypass them by assuming ordinary thread-shared object semantics.
