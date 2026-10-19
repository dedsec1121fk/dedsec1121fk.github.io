# c — consolidated language guide

## C

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.c`.

**How to run / environment:** cc main.c -o main && ./main.

### Starter example

```
#include <stdio.h>
void greet(const char *name) { printf("Hello, %s!\n", name); }
int main(void) { greet("Ada"); return 0; }
```

### How to read it

Manage pointer lifetimes and check errors in real applications.

### Common pitfall

Manage pointer lifetimes and check errors in real applications. 

### Learn memory layout through a bounded parser
In C, the programmer controls buffers and lifetimes. A string is a byte sequence ending in NUL, while a packet buffer is not automatically a C string. Never read a serialized multibyte integer by blindly casting arbitrary bytes to a struct pointer; alignment, padding and endianness can differ.
```c
#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
bool decode_u16_le(const uint8_t *data, size_t len, uint16_t *out) {
    if (!data || !out || len < 2) return false;
    *out = (uint16_t)data[0] | ((uint16_t)data[1] << 8);
    return true;
}
```
Compile your own code with diagnostics such as `cc -std=c11 -Wall -Wextra -Wconversion -g -fsanitize=address,undefined test.c` when supported. Contrast stack automatic storage and `malloc` allocations, and free exactly once along every owned path. A pointer plus length expresses a safer buffer contract than a bare pointer.

**Lab:** write a length-prefixed record parser with tests for empty data, short header, exact length and oversized count. Reference: https://en.cppreference.com/w/c and toolchain docs.

### C memory safety: a bounded parser with real tests

C gives direct access to buffers; your code must maintain their bounds and lifetimes. A simple integer decoder demonstrates how to avoid reading beyond a binary input:

~~~c
#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
bool read_u16le(const unsigned char *p, size_t n, uint16_t *out) {
    if (!p || !out || n < 2) return false;
    *out = (uint16_t)p[0] | ((uint16_t)p[1] << 8);
    return true;
}
~~~

Make an array with bytes 0x34, 0x12. The expected value is 0x1234 (4660). Then call with lengths 0, 1 and 2; only the third case may succeed. Verify that a null output pointer is rejected. Note that cast-before-shift avoids depending on the signedness of plain char.

Compile your *own* test program with warnings and, where supported, sanitizers: cc -Wall -Wextra -Wpedantic -g -fsanitize=address,undefined test.c -o test. Sanitizer availability varies by compiler and device. Never infer memory safety from “it didn't crash once”; run boundary tests and review pointer ownership.

Write down the buffer's allocated capacity, provided length and valid range. For any API accepting a pointer and size, treat size as part of the contract. Prefer size_t for array lengths and be careful when converting negative signed values to unsigned.

**Passing result:** correct little-endian interpretation and clean rejection of short/null inputs. Cross-check against a hex viewer on the same bytes.

## C — Expanded practice workbook

### Why atoi is insufficient
atoi does not report errors reliably; parsing invalid text as an integer may silently produce a misleading result. Prefer strtol with an end pointer, errno handling and an explicit range check. This function returns a success flag and writes to an output pointer only on success.

### Build and observe
Save as main.c and run gcc -std=c11 -Wall -Wextra -pedantic main.c -o parser && ./parser. Expected C parser OK. Compile without defining NDEBUG during this test, because C assert calls are disabled with that macro.

~~~c
#include <assert.h>
#include <ctype.h>
#include <errno.h>
#include <stdlib.h>
#include <stdio.h>
static int parse_port(const char *s, int *out) {
    if (s == NULL || out == NULL) return 0;
    char *end;
    errno = 0;
    long n = strtol(s, &end, 10);
    if (s == end || errno == ERANGE) return 0;
    while (isspace((unsigned char)*end)) ++end;
    if (*end != '\0' || n < 1 || n > 65535) return 0;
    *out = (int)n;
    return 1;
}
int main(void) {
    int result = 0;
    assert(parse_port(" 8080 ", &result) && result == 8080);
    assert(!parse_port("abc", &result));
    assert(!parse_port("65536", &result));
    assert(!parse_port(NULL, &result));
    puts("C parser OK");
    return 0;
}
~~~

### Read the safeguards
s==end identifies a missing numeric prefix. errno==ERANGE detects overflow/underflow in strtol. The while loop permits trailing whitespace but rejects trailing words; unsigned char casting protects the precondition of isspace. NULL input and output pointers are rejected before dereferencing.

### Challenges and proof
Try empty text, only spaces, -1, +5, hexadecimal 0x10 under base 10, and very large integers. Add an alternative version that accepts only unsigned decimal digits (so even a leading + is rejected). Compile with sanitizers when available: -fsanitize=address,undefined -fno-omit-frame-pointer, and explain that sanitizer support varies across toolchains.

### Troubleshooting
A segmentation fault is not a standard validation error. Compile warnings at maximum practical level and reproduce a minimal case. On Termux install a working C toolchain rather than assuming a desktop gcc package exists; clang may be the supplied compiler.
Success: no invalid values accepted and no dereference of NULL. https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf.html

## C — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `cc -std=c11 -Wall -Wextra -pedantic {file} -o demo && ./demo`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## C — Technical notes and common pitfalls

### Core knowledge

1. Array bounds are not automatically checked for ordinary pointer operations.
2. Keep a single clear owner for allocated memory and release it exactly once.
3. Check return values and lengths when reading external input; avoid unsafe unbounded string functions.

## Ada

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.adb`.

**How to run / environment:** gnatmake hello.adb && ./hello.

### Starter example

```
with Ada.Text_IO; use Ada.Text_IO;
procedure Hello is
begin
   Put_Line("Hello, Ada!");
end Hello;
```

### How to read it

Ada prioritizes strong types and clear contracts.

### Common pitfall

Ada prioritizes strong types and clear contracts.

## Ada — Expanded practice workbook

### Read the baseline source
~~~text
with Ada.Text_IO; use Ada.Text_IO;
procedure Hello is
begin
   Put_Line("Hello, Ada!");
end Hello;
~~~

**Relevant environment:** gnatmake hello.adb && ./hello.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Define a constrained integer subtype and reject a value outside the range. Compare compile-time subtype rules with runtime Constraint_Error checks.

### The failure that must be understood
Ada range checks can be affected by compiler settings and SPARK proof is distinct from plain Ada compilation. Keep exception boundaries explicit.

## Odin

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.odin`.

**How to run / environment:** odin run hello.odin -file.

### Starter example

```
package main
import "core:fmt"
main :: proc() { fmt.println("Hello, Ada!") }
```

### How to read it

Odin is a compiled systems language with explicit procedures.

### Common pitfall

Odin is a compiled systems language with explicit procedures.

## Odin — Expanded practice workbook

### Read the baseline source
~~~text
package main
import "core:fmt"
main :: proc() { fmt.println("Hello, Ada!") }
~~~

**Relevant environment:** odin run hello.odin -file.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Allocate a slice and iterate it with bounds-aware indexing, then create a temporary arena allocation with a clear lifetime. Inspect context usage.

### The failure that must be understood
Odin's allocator/context model is not C malloc by default. Be careful returning slices into temporary storage.

## WebAssembly Text (WAT)

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.wat`.

**How to run / environment:** Validate via wat2wasm hello.wat.

### Starter example

```
(module
  (func (export "answer") (result i32)
    i32.const 42))
```

### How to read it

Exports a function; it requires a WebAssembly host to call it.

### Common pitfall

Exports a function; it requires a WebAssembly host to call it.

## WebAssembly_Text_WAT — Expanded practice workbook

### Read the baseline source
~~~text
(module
  (func (export "answer") (result i32)
    i32.const 42))
~~~

**Relevant environment:** Validate via wat2wasm hello.wat.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Implement a module with an exported add(i32,i32)->i32 and instantiate it in a local host. Compare stack instructions with source-language expressions.

### The failure that must be understood
WAT is textual Wasm, not JavaScript; imports, exports and memory pages must match the embedding host. Validate with wat2wasm where available.