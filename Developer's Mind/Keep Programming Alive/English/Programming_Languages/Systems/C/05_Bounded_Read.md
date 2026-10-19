# Safe C starts by validating lengths before copying bytes

## Avoid implicit trust in array capacity
A buffer has a fixed capacity unrelated to the number of bytes in an input string. Before copying, establish the actual input length, reserve room for the terminating NUL byte and reject data that cannot fit. Functions that do not know the destination capacity cannot enforce the right limit. A correct length check should not overflow when adding one.

~~~c
#include <stdio.h>
#include <string.h>
int copy_label(char dst[static 8], const char *src) {
    size_t n = strlen(src);
    if (n >= 8) return -1;
    memcpy(dst, src, n + 1);
    return 0;
}
int main(void) {
    char label[8];
    if (copy_label(label, "sample") != 0) return 1;
    puts(label);
    return 0;
}
~~~

## Understand the assumption
`strlen()` itself assumes `src` points to a valid NUL-terminated string; it must not receive arbitrary untrusted byte arrays with no terminator. When parsing a file or network frame, pass explicit lengths and use `memchr` or bounded parsers rather than relying on string termination. The 8-byte destination can hold at most seven non-NUL characters.

## Observe errors with a compiler
Use diagnostic warnings and, where supported, AddressSanitizer or UndefinedBehaviorSanitizer on your **own test program**. An absence of sanitizer reports is not proof of memory safety for all inputs. Test exactly seven characters, eight characters and an empty string, checking the return code and output.

## Design extension
Rewrite `copy_label` to accept an explicit destination capacity parameter rather than hard-coding 8. Document what happens if capacity is zero and how the caller should respond. Do not work around overflow by truncating silently unless truncation is an explicit product requirement.
## Parse integer text without accepting a valid prefix

A numeric conversion can consume a valid prefix while leaving unrelated bytes behind. Treating 12junk as the integer 12 is incorrect for a field whose entire contents must be a number. Check whether any characters were consumed, inspect the end pointer, test range errors and enforce the application's smaller domain before converting to a narrower type.

This example accepts unsigned decimal syntax only, rejects leading whitespace and signs by policy, and then checks an explicit 0–1000 range. The C library's conversion range and the application's allowed range are different contracts. A bounded input buffer prevents one class of overflow; it does not validate the meaning of its contents.

```c
#include <assert.h>
#include <errno.h>
#include <stdlib.h>
static int parse(const char *s, long *out) {
    if (!*s) return 0;
    for (const char *p=s; *p; ++p) if (*p<'0' || *p>'9') return 0;
    errno=0; char *end; long value=strtol(s,&end,10);
    if (errno==ERANGE || *end || value>1000) return 0;
    *out=value; return 1;
}
int main(void) { long x; assert(parse("12",&x)&&x==12); assert(!parse("12junk",&x)); assert(!parse("-1",&x)); assert(!parse("1001",&x)); }
```

Add an empty string, a long sequence of digits and a boundary value of 1000. Keep locale-dependent syntax out of a wire protocol unless the protocol explicitly permits it. Do not narrow a long to an int before checking the intended range.

[Technical reference](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)
