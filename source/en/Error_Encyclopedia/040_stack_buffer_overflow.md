# Stack buffer overflow — a fixed-array copy with failure atomicity

## What the failure actually means
Stack-buffer-overflow means an automatic array on the stack is accessed beyond its bounds. A frequent mistake is treating an eight-byte destination as capacity for eight visible characters when a C string also needs one NUL byte. Replacing strcpy with an unchecked memcpy does not solve the problem; the destination capacity must be part of the contract.

## Controlled solution
Implement a helper that receives the actual destination capacity and checks strlen(source) before copying. The example uses an eight-byte local array and shows a seven-character input succeeds, an eight-character input is rejected without changing the previous string, and the empty input leaves a valid terminator. Unlike an unsafe reproducer, no call intentionally writes outside the array.

## Source example
Save this as stack_buffer_lab.c.

~~~c
#include <stdio.h>
#include <string.h>
static int copy_label(char dest[8], size_t capacity, const char *source) {
    if (!dest || !source || capacity == 0) return -1;
    size_t n = strlen(source);
    if (n >= capacity) return -2; /* account for the final NUL */
    memcpy(dest, source, n + 1);
    return 0;
}
int main(void) {
    char small[8] = {0};
    if (copy_label(small, sizeof small, "example") != 0) return 1;
    if (strcmp(small, "example") != 0) return 2;
    if (copy_label(small, sizeof small, "12345678") != -2) return 3;
    if (strcmp(small, "example") != 0) return 4;
    if (copy_label(small, sizeof small, "") != 0) return 5;
    if (strcmp(small, "") != 0) return 6;
    puts("PASS: exact fit, rejected long input, unchanged buffer");
}
~~~

## Why this design works
The precondition is that source is a valid, terminated C string. strlen on an invalid or unterminated pointer can already read beyond accessible memory, so parsing binary or untrusted buffers must use bounded input lengths instead. A function parameter written char dest[8] is adjusted to a pointer in C; sizeof dest inside the helper would not return eight. That is why the caller supplies sizeof small explicitly.

## Reproduce the diagnosis safely
Compile gcc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -g stack_buffer_lab.c -o stack_buffer_lab && ./stack_buffer_lab. Expected output is PASS. Build without the sanitizer only if it is unavailable and record the reduced coverage.

## Practice and expected evidence
Extend the tests to a one-byte destination, zero capacity, and a missing pointer without dereferencing it. Discuss why an error must not partially alter output. Try passing capacity 7 instead of sizeof small and verify that the conservative check rejects a seven-character input. Explain why exact buffer bounds matter more than whether data lives on the stack or heap.

**Authoritative reference:** https://clang.llvm.org/docs/AddressSanitizer.html
