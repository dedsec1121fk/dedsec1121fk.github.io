# jsonnet — consolidated language guide

## Jsonnet

### How the language behaves
Jsonnet is a data templating language supporting object composition and computed fields, commonly producing JSON configuration.

### Source fragment to analyze
```text
local base = { port: 8080 };
base + { host: '127.0.0.1' }
```

### Deliberate exercise
Render the object and verify types for both fields. Test a second object with overlapping keys to see composition semantics.

### Check a failure condition
Config generation does not validate business constraints automatically; apply a schema and check unexpected overrides.

Record input, expected output and observed output with the actual Jsonnet implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Jsonnet — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Jsonnet. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
local name = 'Ada';
{ greeting: 'Hello, ' + name + '!' }
~~~

**Run context:** jsonnet hello.jsonnet.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Create base configuration and two local overlays. Render both JSON documents, diff the resulting keys, and validate ports in the consumer rather than trusting generation alone.

### Boundary-case investigation
The + object merge is not always a recursive merge; experiment with nested fields and learn Jsonnet inheritance syntax before claiming preservation.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Jsonnet. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.
