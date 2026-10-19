# C implicit function declaration: the correct prototype matters

## What the compiler is telling you
C11 requires a visible declaration before calling a function. A missing prototype is not a linker error: the compiler lacks the correct function signature at the call site and might assume unsafe calling conventions in old C dialects. For standard-library functions, include the documented standard header; do not guess the return type or hand-write an incompatible prototype. The strlen function is declared by string.h, not by stdio.h.

## Reproduce the warning-as-error and fix it
Run sh reproduce.sh after saving the script below on Linux or Termux with a suitable C11 compiler. The first compilation deliberately lacks string.h and must fail. The second inserts the correct standard header and checks that the output is 3. All files are disposable, and the commands never modify project sources.

~~~sh
#!/usr/bin/env sh
set -eu
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
cat > "$work/broken.c" <<'C'
#include <stdio.h>
int main(void) {
    printf("%zu\n", strlen("Ada"));
    return 0;
}
C
if cc -std=c11 -Wall -Wextra -Werror=implicit-function-declaration "$work/broken.c" -o "$work/broken" 2>"$work/error.log"; then
  echo 'FAIL: call without prototype was not diagnosed' >&2
  exit 1
fi
{ printf '#include <string.h>\n'; cat "$work/broken.c"; } > "$work/fixed.c"
cc -std=c11 -Wall -Wextra -Werror "$work/fixed.c" -o "$work/fixed"
output=$("$work/fixed")
test "$output" = '3'
printf 'PASS: missing declaration rejected; correct header restored\n'
~~~

## Why suppression is the wrong correction
Disabling an implicit-declaration diagnostic does not establish the correct return type or parameter conversions. On 64-bit platforms, silently treating a pointer-returning function as int can truncate an address and crash. For a project-owned function, place the declaration in a shared header and include it from both caller and implementation. For an external library, confirm which package supplies the declaration and link the matching implementation separately; these are two different checks.

## Practical fault isolation
1. Compare the compiler's diagnostic with the failure from the undefined-reference lesson: in which build stage does each arise?
2. Replace strlen with a private function, write a header defining its prototype and deliberately mismatch one parameter type. Explain why the compiler can now detect the mismatch.
3. Compile under the C standard the project actually supports; document GCC or Clang version and flags. Never rely on permissive pre-C99 implicit-function rules.
4. When cross-compiling for Android, confirm target-compatible headers and libraries in the toolchain rather than copying host headers into the project.

**Evidence:** rejected invalid compile, valid compile and output 3, plus a written rule for where project prototypes live.

**Reference:** https://en.cppreference.com/w/c/string/byte/strlen.html
