# dhall — consolidated language guide

## Dhall

### Working model
Dhall is a typed configuration language with import and normalization behavior; its goal is reproducible configuration values rather than unrestricted scripting.

### Focused source example
```text
{ name = "example", retryCount = 3, enabled = True }
```

Change retryCount to a text literal and predict why the inferred record type changes. Use a validator that expects an explicit schema.

### Evidence to collect
Record the exact Dhall compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Treat remote imports and hashing policies deliberately; typed configuration alone does not establish trust in a network source.

## Dhall: applied exercises

Dhall describes typed configuration values; it is not a shell script or a general-purpose imperative language. Read the [source lesson](Dhall.md) before working. The objective here is to reject a malformed setting *at type-check time* rather than hoping that a consuming application notices it.

### Create a typed record
Save the following text in `config.dhall`:

~~~dhall
let Config = { name : Text, retryCount : Natural, enabled : Bool }
let instance : Config = { name = "example", retryCount = 3, enabled = True }
in instance
~~~

With the Dhall CLI available, check it using `dhall type --file config.dhall`, then evaluate using `dhall --file config.dhall`. Explain the difference between a record type, a value and the explicit `: Config` annotation. Replacing 3 with 0 keeps the Natural type. Replacing 3 with `"three"` or a negative number violates that declared type. Capture the tool's actual messages after each deliberate change.

### Shape, normalization and imports
First add `region = "eu"` to the value while leaving Config unchanged. Determine how an exact record type exposes an unexpected field. Next compare the Dhall expression `1 + 2` with its normalized result; normalization computes a value, whereas textual replacement merely changes source characters. Create a separate `defaults.dhall` containing a valid local Dhall literal and import it through `./defaults.dhall`. Remove that file and record what fails. All test data should remain local, with no network imports.

### Security and reproducibility boundaries
Type correctness is **not** proof that an imported source is trusted. A real application using remote Dhall imports needs a policy for dependency hashes, locked versions and offline availability. Note that the same normalized value can have multiple source representations. Export JSON only after verifying it matches the consuming application's schema.

**Evidence:** Dhall version; a successful type check; failures for wrong type, changed record shape and missing local import; one normalization observation. If Dhall is unavailable, explicitly mark the examples **not executed**.

## Dhall — Focused mastery pathway

### Applied exercises

1. Define a minimal valid configuration and invalid variants.
2. Check whether merging rules overwrite or combine nested values.
3. Store and review changes in version control without secrets.

- Is the file interpreted as data or executed as code?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?
