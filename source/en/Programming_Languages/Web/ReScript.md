# rescript — consolidated language guide

## ReScript

### Operational idea
ReScript compiles a statically typed syntax to JavaScript, with strong interoperability but explicit differences from ordinary JS.

### Source or deliberately marked concept
```text
let double = (n: int): int => n * 2
```

### Apply it to one controlled task
Compile a function and inspect emitted JavaScript. Compare typed option handling with undefined values arriving from raw JS.

### Check the important boundary
Typed bindings do not validate arbitrary runtime JSON; schema-check untrusted data at the JS boundary.

Work with disposable data in a genuine implementation of ReScript where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## ReScript — Expanded practice workbook

### Read the baseline source
~~~text
let greet = name => "Hello, " ++ name ++ "!"
Js.log(greet("Ada"))
~~~

**Relevant environment:** Compile within a ReScript project.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Define a variant for Loading|Ready(int)|Failed(string), exhaustively switch over it and compile to JS. Validate remote JSON before trusting static types.

### The failure that must be understood
ReScript versions have changed syntax; old ReasonML and BuckleScript examples may not compile. Check the project's ReScript compiler.
