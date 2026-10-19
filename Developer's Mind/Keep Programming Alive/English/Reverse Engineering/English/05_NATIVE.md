# Disassembly and pseudocode

## Concept

Native executables contain machine instructions. A decompiler approximates source-like control flow; compiler optimizations can remove names, inline calls and reorganize branches.

## Without AI: practice

Compile a tiny C program with one if/else at two optimization levels. Compare source, output and available readelf, objdump or Ghidra views offline.

## Verify it

Identify a static branch without claiming it was taken in every execution.

## With AI (optional)

Ask AI to explain selected assembly instructions; test its interpretation against the source you own.

## A practical Ghidra reading pass
For a small executable you compiled yourself, record compiler/flags and save a hash of the binary. Import it into a new project, confirm the *correct language/architecture*, and run default analysis. Start in the Symbol Tree, locate `main` or the entry path, follow cross-references and mark likely input/output functions. Compare Listing bytes/instructions, Function Graph branches, and Decompiled C-like pseudocode. **The decompiler is a hypothesis**: optimized builds remove variables, merge branches and inline functions.

**Tiny C exercise:**
```c
#include <stdio.h>
int classify(unsigned n) { return n > 100 ? 2 : n > 0 ? 1 : 0; }
int main(void) { printf("%d\\n", classify(42)); }
```
Compile locally with debugging symbols then compare with an optimized build. Identify which assembly condition corresponds to `n > 100`; note whether the compiler simplifies the call for a constant. Rename functions/variables as analyst annotations; do not claim those were original source names.

**Cross-validation:** run inputs 0, 1, 100 and 101 against your program; write the predicted and actual outputs. Save screenshots/addresses, distinguish observed behavior from inferred intent. Reference: NSA Ghidra Beginner guide, https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/GhidraClass/Beginner.

## From source to a real control-flow graph

Compile only a program you own. An unoptimized and optimized build may have identical output but entirely different instruction layout. Use this example to make that visible:

~~~c
#include <stdio.h>
int band(unsigned x) {
    if (x == 0) return 0;
    if (x <= 9) return 1;
    return 2;
}
int main(void) { printf("%d\n", band(12)); }
~~~

On a desktop Linux toolchain, compile as two separately named binaries:

~~~sh
cc -g -O0 band.c -o band-debug
cc -g -O2 band.c -o band-opt
file band-debug band-opt
objdump -d band-debug
objdump -d band-opt
~~~

In Ghidra import both artifacts into separate project programs. Identify architecture and entry point before reading pseudocode. Locate the function corresponding to band, then build a table for inputs 0, 1, 9, 10, and 255, with predicted output, observed output, and the branch responsible. On optimized output the compiler may merge, invert or remove branches; instruction count is not a line-by-line measure of the original C.

Rename discovered labels as your own hypotheses, not original source names. If an architecture disassembler is unavailable on a phone, perform the source/test phase there and record the desktop-only dependency honestly. Consult the Ghidra beginner course: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/GhidraClass/Beginner.

**Pass condition:** you can explain one compiled conditional by referring to input/output evidence and a basic block, and can state one decompiler uncertainty.
