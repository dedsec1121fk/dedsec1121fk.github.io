# groovy — consolidated language guide

## Groovy

### Mental model
Groovy runs on the JVM and offers dynamic properties, closures and a concise syntax useful in build tooling.

### Minimal source sample
```text
def nums = [1, 2, 3]
println nums.collect { it * 2 }
```

### Experiment to carry out
Predict the mapped list, then use findAll to filter values without mutating the original list.

### A specific failure to distinguish
A Gradle Groovy DSL is an API built on Groovy, not every arbitrary Groovy script; document the host context.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Groovy environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

### Follow-through
Prepare one harmless counterexample, identify where behavior diverges and classify the cause as input handling, type rules, execution semantics or an unavailable host API. Preserve only non-sensitive fixtures and tool version information so a future maintainer can reproduce the same observation.

## Groovy — Expanded practice workbook

### Read the baseline source
~~~text
def greet(name) { "Hello, ${name}!" }
println greet('Ada')
~~~

**Relevant environment:** groovy hello.groovy.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Parse a JSON object using JsonSlurper and validate a property before interpolating it into a GString. Compare closure scoping and map property access.

### The failure that must be understood
GString interpolation is not escaping; unsafe values must not enter shell, SQL or HTML contexts directly. Gradle Groovy and standalone Groovy environments differ.

## Groovy — Focused mastery pathway

### Foundation exercise
Use JsonSlurper to parse a small local JSON document, validating expected numeric fields before using them.

### Problem-solving exercise
Compare a Groovy Map and a strongly typed Java-compatible object. Inspect the difference between ordinary strings and GString interpolation.

### Independent project
Build a read-only Gradle report of project properties, ensuring any untrusted text is treated as data rather than command or SQL syntax. Record the Groovy/Gradle version.
