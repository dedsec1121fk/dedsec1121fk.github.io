# Double free — ownership transfer and cleanup invariants

## What the failure actually means
Calling free twice for the same allocation is undefined behavior, even if a program appears to keep running. It usually means two cleanup paths believe they own the same allocation: one function frees the memory while another alias still treats it as live. The allocator or AddressSanitizer may report attempting double-free, but the exact error text and crash behavior vary.

## Controlled solution
Design one owner for each allocation. This helper returns a new buffer only through an output pointer; the caller owns and releases it exactly once on success. On failure it returns a status and leaves the caller output as NULL. This avoids a dangerous reproducer and exercises both success and error cleanup in isolation.

## Source example
Save this as double_free_lab.c.

~~~c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int make_label(char **out, const char *source) {
    if (!out || !source) return -1;
    *out = NULL;
    size_t n = strlen(source);
    if (n > 64) return -2;
    char *p = malloc(n + 1);
    if (!p) return -3;
    memcpy(p, source, n + 1);
    *out = p;  /* caller now owns p */
    return 0;
}
int main(void) {
    char *owner = NULL;
    if (make_label(&owner, "safe") != 0) return 1;
    if (strcmp(owner, "safe") != 0) return 2;
    free(owner);
    owner = NULL;
    free(owner); /* C defines free(NULL) as a no-op */
    if (make_label(&owner, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789too-big") != -2 || owner != NULL) return 3;
    puts("PASS: single owner, cleanup, error path");
}
~~~

## Why this design works
A successful transfer sets the output pointer only after allocation and copy complete. free(NULL) is explicitly permitted in ISO C; setting one local variable to NULL after free protects only that variable, not other aliases. The helper assumes source is a valid, NUL-terminated C string: a pointer to untrusted nonterminated memory violates that contract even before malloc. In a larger API, document which function destroys the allocation and never free an object after transferring it to another owner.

## Reproduce the diagnosis safely
Compile and run using gcc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -g double_free_lab.c -o double_free_lab && ./double_free_lab. If a sanitizer is not available, use the strict warnings and ordinary execution, reporting the limitation. Deliberately corrupting live application allocations is not required.

## Practice and expected evidence
Record the owner before and after success, simulate a rejected overlong label, and verify that failed allocation paths cannot double-release a value. Add a conceptual trace with two aliases and explain why nulling one does not invalidate the other. Prefer C++ RAII where available. A sanitizer checks exercised paths, not every possible input.

**Authoritative reference:** https://clang.llvm.org/docs/AddressSanitizer.html
