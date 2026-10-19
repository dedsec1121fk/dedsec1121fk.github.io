# C linker error: undefined reference to add

## Why compilation can succeed while linking fails
A declaration tells the C compiler that a function exists and how it can be called; it does not provide machine code for that function. Each .c file is normally compiled to a translation unit, then linked with other object files or static/shared libraries. If an object defining add is absent, compilation of main.c may succeed while linking reports an undefined reference. Adding another header without linking the implementation does not resolve that missing symbol.

## Offline reproduction and repair — C11
Save the following as reproduce.sh and run sh reproduce.sh on Linux/Termux with a C compiler installed. All source and binary files live in a disposable directory. The test deliberately expects the first link to fail, then verifies that linking both translation units produces exit code zero.

~~~sh
#!/usr/bin/env sh
set -eu
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
cat > "$work/main.c" <<'C'
int add(int a, int b);
int main(void) { return add(2, 3) == 5 ? 0 : 1; }
C
cat > "$work/add.c" <<'C'
int add(int a, int b) { return a + b; }
C
if cc -std=c11 -Wall -Wextra -Werror "$work/main.c" -o "$work/broken" 2>"$work/error.log"; then
  echo 'FAIL: missing object was incorrectly linked' >&2
  exit 1
fi
cc -std=c11 -Wall -Wextra -Werror "$work/main.c" "$work/add.c" -o "$work/fixed"
"$work/fixed"
printf 'PASS: missing definition rejected; both translation units linked\n'
~~~

## Diagnosing a larger build
Compile each file separately with cc -c main.c and cc -c add.c, then link both object files. If the definition is in an archive, the order of object files and -l flags can matter on GNU-style linkers because a static library is searched for currently unresolved symbols. On a compatible system, nm main.o may show U add and nm add.o may show T add. If the name exists but linking still fails, investigate C versus C++ name linkage, architecture mismatch and which library binary was actually selected.

## Questions and boundaries
1. Remove only add.c from the successful link line and predict the stage of failure. Distinguish a missing declaration from a missing definition.
2. Change the definition's name to sum_values without changing the declaration. Explain why editing the header alone is insufficient.
3. Create a static archive using ar rcs libmathlocal.a add.o and compare both orders: main.o -L. -lmathlocal and -L. -lmathlocal main.o on a suitable linker. Record which works.
4. Inspect the saved error.log in the temporary directory before cleanup by adding a diagnostic line. Do not silence the linker with suppression flags.

**Evidence:** the initial nonzero link result, PASS from the corrected build, and an explanation of the two distinct compilation stages.

**Reference:** https://gcc.gnu.org/onlinedocs/gcc/Link-Options.html
