# Pointer — bounds, aliasing and the lifetime contract

## Exact meaning
A pointer identifies a location or object in an address space; it is not a guarantee that the object remains alive, belongs to the right type or contains the required number of elements. In C a valid pointer can refer to the first element of an array, to one of its interior elements or one position past its end. The one-past pointer may be formed in limited circumstances but must not be dereferenced. Accessing released storage, a dead stack object or an out-of-bounds element has undefined behavior.

## Runnable C11 example
Save as pointer.c. Compile with gcc -std=c11 -Wall -Wextra -Werror -pedantic -fsanitize=address,undefined pointer.c -o pointer when the sanitizer runtime is available, then execute ./pointer. The code deliberately avoids constructing an invalid access; assertions establish observable aliasing and rejection of invalid indices.

~~~c
#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>

static bool replace_at(int *data, size_t length, size_t index, int value) {
    if (data == NULL || index >= length) return false;
    data[index] = value;
    return true;
}
int main(void) {
    int numbers[] = {3, 5, 8};
    size_t count = sizeof(numbers) / sizeof(numbers[0]);
    int *second = &numbers[1];
    assert(*second == 5);
    assert(replace_at(numbers, count, 1, 9));
    assert(*second == 9);
    assert(!replace_at(numbers, count, count, 10));
    assert(numbers[2] == 8);
    assert(!replace_at(NULL, 0, 0, 1));
    puts("PASS pointer: alias, lifetime-safe scope, bounds, NULL");
}
~~~

## Reason about the memory model
The variable second points to numbers[1], so replacing that element changes the value seen through both expressions. It remains valid only while numbers exists in the same call frame. The length parameter is an independent contract: a pointer value cannot reveal the array length in a called C function. C does not automatically check pointer bounds. Passing NULL is rejected here before dereference, but non-NULL does not prove an address is valid. A helper returning &local_variable from a function would violate lifetime even if its printed address looks plausible.

## Controlled investigations
1. Change the index to count and verify replacement fails without modifying any item. Explain why writing numbers[count] would be undefined rather than a legitimate boundary test.
2. Move the array into a helper, return a pointer to a local variable and explain the failure **without executing** the invalid dereference. Compare with storage owned by the caller.
3. Separate pointer constness: contrast const int * (read-only through the pointer) and int *const (nonreassignable pointer variable).
4. Compile in debug and optimized builds; use AddressSanitizer only for deliberately isolated synthetic tests. Never infer safety solely from an absence of crashes.

**Evidence:** the PASS line, compiler command/version, correct array size and an explicit lifetime/ownership statement.
