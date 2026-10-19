# zig — consolidated language guide

## Zig

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.zig`.

**How to run / environment:** zig run hello.zig (API can change by version).

### Starter example

```
const std = @import("std");
pub fn main() void {
    std.debug.print("Hello, Ada!\n", .{});
}
```

### How to read it

Check the Zig version; its standard library evolves rapidly.

### Common pitfall

Check the Zig version; its standard library evolves rapidly.

## Zig — Expanded practice workbook

### Read the baseline source
~~~text
const std = @import("std");
pub fn main() void {
    std.debug.print("Hello, Ada!\n", .{});
}
~~~

**Relevant environment:** zig run hello.zig (API can change by version).. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Use std.testing.expect on a bounded slice index and manage an allocator-owned buffer with defer. Compare optional ?T with error union !T.

### The failure that must be understood
Zig standard-library APIs change between releases; pin the compiler and avoid copying allocator examples from different versions.

## Zig — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `zig run {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Zig — Technical notes and common pitfalls

### Core knowledge

1. Explicit memory allocators expose allocation policy in APIs.
2. Error unions and optionals represent failure and absence of values.
3. Version compatibility matters; review standard-library examples against the installed compiler.
