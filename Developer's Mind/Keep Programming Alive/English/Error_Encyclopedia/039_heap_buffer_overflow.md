# Heap buffer overflow — exact allocation and checked copy

## What the failure actually means
A heap-buffer-overflow occurs when code reads or writes outside an allocated dynamic buffer. It often comes from allocating strlen(source) bytes and then copying the trailing NUL as well, trusting an unbounded length or making size_t arithmetic overflow. A heap corruption may manifest later than the offending operation; use a source-level size contract, not the absence of a crash, as evidence of safety.

## Controlled solution
Implement a copy function with one owner and a strict application policy of at most 32 content bytes. The allocation is n+1 for the terminator. The function rejects an overlong string before allocation and leaves the output NULL on failure. All test strings are synthetic and NUL-terminated, so no external data or unsafe overflow is executed.

## Source example
Save this as heap_buffer_lab.c.

~~~c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int copy_text(const char *source, char **out) {
    if (!source || !out) return -1;
    *out = NULL;
    size_t n = strlen(source);
    if (n > 32) return -2;  /* policy cap also prevents n+1 overflow */
    char *buffer = malloc(n + 1);
    if (!buffer) return -3;
    memcpy(buffer, source, n + 1);
    *out = buffer;
    return 0;
}
int main(void) {
    char *result = NULL;
    if (copy_text("hello", &result) != 0) return 1;
    if (strcmp(result, "hello") != 0) return 2;
    free(result);
    result = NULL;
    if (copy_text("012345678901234567890123456789012", &result) != -2 || result != NULL) return 3;
    if (copy_text("", &result) != 0 || strcmp(result, "") != 0) return 4;
    free(result);
    puts("PASS: exact allocation, upper bound, empty string");
}
~~~

## Why this design works
The policy cap prevents overflow of n+1 and bounds the allocation. The test verifies a normal copy, rejected input with 33 bytes and an empty string, which still allocates one terminator byte. strlen itself assumes a valid terminated source. For arbitrary incoming data use a length-delimited input and verify the claimed accessible size before scanning memory. calloc is not a substitute for capacity checks and memcpy does not check destination size.

## Reproduce the diagnosis safely
Compile with gcc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -g heap_buffer_lab.c -o heap_buffer_lab && ./heap_buffer_lab. A sanitizer can report invalid memory access along paths it runs, but does not establish universal safety.

## Practice and expected evidence
Change the policy to 16 and verify that a 17-byte value is rejected. Explain why an allocation of n rather than n+1 would be wrong. Consider the behavior when out aliases source storage and document a non-aliasing precondition; the helper is intended for distinct caller-owned output pointers. Capture expected and observed results for each boundary.

**Authoritative reference:** https://clang.llvm.org/docs/AddressSanitizer.html
