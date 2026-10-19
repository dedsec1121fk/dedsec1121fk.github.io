# risc_v_assembly — consolidated language guide

## RISC-V assembly

### How the language behaves
RISC-V instruction sets separate general register operations, loads/stores and optional extensions; the exact ISA variant matters.

### Source fragment to analyze
```text
li t0, 7
li t1, 2
add t2, t0, t1
```

### Deliberate exercise
Trace t0, t1 and t2 with a simulator that matches RV32 or RV64 as chosen; note which lines are pseudo-instructions.

### Check a failure condition
Misaligned memory access and sign extension depend on instruction and environment; never infer behavior from a different CPU ISA.

Record input, expected output and observed output with the actual RISC_V_Assembly implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## RISC V Assembly: applied exercises

### Study a standalone register fragment
The following RISC-V RV32I-style sequence is a **fragment**, not a complete hosted program or a Linux system-call example:

~~~asm
addi t0, zero, 3
slli t1, t0, 1
add  t2, t0, t1
addi zero, t2, 9
~~~

After the first three instructions, `t0=3`, `t1=6`, `t2=9`. The final instruction attempts to write to register `zero`; writes to x0 are discarded, so x0 remains zero. Execute one step at a time in an RV32I-capable simulator and record exact register snapshots. Distinguish architectural registers from assembler names such as `t0`, and do not call this a self-contained executable without entry/exit code.

### Contrast immediates and arithmetic
`addi` adds a sign-extended immediate, while `slli` shifts the original bit pattern by an immediate count. Test input zero, then a value near the signed 32-bit limit, and explain modulo-32-bit behavior rather than assuming unbounded mathematical integers. For RV64 or compressed extensions, state the selected ISA mode explicitly before comparing machine encodings.

### Reproduce a real assembler error
Change the immediate to a value that cannot be represented by the 12-bit signed encoding of `addi`, then inspect the assembler's diagnostic or pseudoinstruction expansion. Assemblers differ in whether they reject a form or rewrite a high-level pseudo-operation. Keep the actual source and output; never report a guessed error text as tested fact.

### Independent task
Build an RV32I function that returns the square of a small integer in ABI return register `a0`, preserving callee-saved registers if used. Test zero, negative input and multiplication availability: the `mul` instruction belongs to the M extension, not base RV32I. Reference: https://riscv.org/technical/specifications/
