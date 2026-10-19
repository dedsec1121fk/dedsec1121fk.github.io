# squirrel — consolidated language guide

## Squirrel

### Operational idea
Squirrel is an embeddable scripting language with tables, closures and class-like object features.

### Source or deliberately marked concept
```text
local values = [2, 4, 6];
::print(values.len());
```

### Apply it to one controlled task
Differentiate an array length query from a table lookup in a host exposing a Squirrel VM.

### Check the important boundary
Host bindings decide which globals exist; a built-in print function is not guaranteed under every embedding.

Work with disposable data in a genuine implementation of Squirrel where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Squirrel — Expanded practice workbook

### Read the baseline source
~~~text
function greet(name) { return "Hello, " + name + "!"; }
print(greet("Ada") + "\n");
~~~

**Relevant environment:** Run with a Squirrel interpreter.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Construct a table with an optional key, check presence before indexing and model a small state machine with explicit transitions. Test wrong-value types.

### The failure that must be understood
Squirrel runtime embeds into a host application; available globals and memory constraints vary. A missing table slot is not a safe default.

## Squirrel — Focused mastery pathway

### Inspect the language's real model
Create a table holding a player's health and score; safely inspect an optional field without assuming a slot exists.

### Controlled failure and recovery
Define a small state machine with menu, active and paused states. Make invalid transitions return a specific error rather than silently changing state.

### Independent practical assignment
Embed the model in a toy simulation and test two event sequences that produce different final states. Document which global functions your host runtime actually provides.
