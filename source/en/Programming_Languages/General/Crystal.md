# crystal — consolidated language guide

## Crystal

### How the language behaves
Crystal compiles a Ruby-like typed language to native code, with type inference and explicit handling of nilable values.

### Source fragment to analyze
```text
numbers = [1, 2, 3]
puts numbers.sum
```

### Deliberate exercise
Check the sum and alter the program so a lookup can return nil; use a branch to prove that the value exists.

### Check a failure condition
Ruby gems and Crystal shards are not interchangeable, and Ruby syntax similarity does not imply ABI compatibility.

Record input, expected output and observed output with the actual Crystal implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Crystal — Expanded practice workbook

### Build a typed transformation
Crystal resembles Ruby syntactically but compiles type-checked native programs. Put this in `scores.cr`:

~~~crystal
scores = [1, nil, 3] of Int32?
doubled = scores.compact_map { |n| n.try { |value| value * 2 } }
raise "wrong result" unless doubled == [2, 6]
puts doubled.join(",")
~~~

Expected output is `2,6`. The explicit `Int32?` means elements can be `Int32` or `Nil`. The `try` call executes the block only for a non-nil receiver; `compact_map` excludes nil results. Confirm with `crystal run scores.cr` and record compiler version. Unlike a Ruby interpreter, the Crystal compiler reasons about types before running the program.

### Observe a compiler failure
Change `value * 2` to `value + "two"` while leaving the data as integers. This is an invalid mixed-type operation. Capture the compiler's error location and explain why turning an integer into a string is not an automatic arithmetic conversion. Restore the valid expression and compile again.

### Semantics of filtering versus conversion
Replace the missing element with `0` and compare `[2, 0, 6]` against the original `[2, 6]`. A missing score is different from a legitimate zero. Decide whether your application should retain a nil slot, reject it, or filter it. These policies change the length and meaning of the output collection. Use a separate fixture for an empty array and confirm that it yields no printed numbers rather than an exception.

### Independent task
Implement `average(scores : Array(Int32?))` with an explicit policy for an all-nil array. Test positive, negative and missing values, plus a large sum near `Int32` limits. Name the return type and justify the chosen numeric representation. Never claim this sample is performance-verified without measurements. Reference: https://crystal-lang.org/reference/

## Crystal — Focused mastery pathway

### Stage 1: understand the execution model
Implement a parser returning Int32? and handle nil through if rather than not_nil!. Test empty, invalid and out-of-range strings. Explain which restrictions are compile-time rather than Ruby's dynamic checks.

### Stage 2: prove the rule with controlled cases
Process an Array of named records using each and compact_map, measuring allocations where Crystal's tooling permits. Compare value-type records with reference objects and identify ownership of mutable elements.

### Stage 3: build a small, reviewable project
Build a small CLI for reading UTF-8 records, with explicit error handling and without assuming a Ruby gem works in Crystal. Add unit specs and verify compiler warnings with a pinned Crystal version.
