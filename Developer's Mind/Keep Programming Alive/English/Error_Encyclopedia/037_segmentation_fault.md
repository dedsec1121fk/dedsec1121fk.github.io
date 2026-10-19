# Segmentation fault: reproduce the memory violation

## Recognize the actual failure
A segmentation fault indicates an invalid memory access detected by the operating system. In C/C++ this can follow dereferencing an invalid pointer, indexing past a buffer, use-after-free or stack exhaustion. The printed crash location may be downstream of the original corruption.

## Inspect safely before changing anything
~~~sh
cc -g -O0 -Wall -Wextra -fsanitize=address,undefined demo.c -o demo
./demo
~~~

## Repair the cause rather than suppressing the warning
Use sanitizers when supported, otherwise a debugger with symbols and a minimized reproducer. Reduce input size and test the last safe index before the failure. Avoid enabling sanitizers on a production executable without understanding overhead and toolchain support. Do not interpret a compiler warning-free build as evidence of memory safety.

**Reference:** https://clang.llvm.org/docs/AddressSanitizer.html

## Tiny boundary experiment
A crash report is evidence of an invalid access, not necessarily the site of its origin. Use a *valid* baseline first:
~~~c
#include <stdio.h>
int main(void) {
    int values[3] = {10, 20, 30};
    for (size_t i = 0; i < sizeof values / sizeof values[0]; ++i)
        printf("%d\n", values[i]);
    return 0;
}
~~~
Compile with `cc -std=c11 -g -O0 -Wall -Wextra -fsanitize=address,undefined demo.c -o demo` where supported. Expected output is three lines: 10, 20, 30. In a disposable lab, change the loop condition to `<=`; a sanitizer can report a stack-buffer-overflow at index 3. Do not run intentionally invalid native samples against important data.

## Trace the fault to ownership
For heap buffers, draw the allocation, every alias, the free operation and subsequent reads. If a pointer was freed but is still referenced, changing the crash location with a log statement does not repair the use-after-free. Validate with a sanitizer-enabled test build and then a normal release build. In a debugger, a stack trace, input fixture and compiler flags are necessary together; a stack trace alone may point after the corruption.
