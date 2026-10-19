# mips_assembly — consolidated language guide

## MIPS assembly

### Working model
MIPS assembly teaches register-based operations, branch delay/history and explicit memory access rather than high-level variable semantics.

### Focused source example
```text
# Illustrative MIPS32 fragment
li $t0, 4
li $t1, 5
addu $t2, $t0, $t1
```

Trace register values and identify what addu does with signed overflow compared with add. Use an emulator matching the chosen MIPS ISA.

### Evidence to collect
Record the exact MIPS_Assembly compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Simulator pseudo-instructions like li may expand to multiple real instructions; branch-delay semantics vary by ISA generation.

## MIPS Assembly: applied exercises

### Compute without hiding the architecture
Use a MIPS32 teaching simulator configured for the following MARS-style service convention. This sample is **not** a portable Linux MIPS syscall program:

~~~asm
.text
.globl main
main:
    li $t0, 3
    sll $t1, $t0, 1
    move $a0, $t1
    li $v0, 1
    syscall
    li $v0, 10
    syscall
~~~

The calculation puts 6 in `$t1`, copies it to `$a0` for integer printing and then uses the simulator's exit service. Confirm simulator version and mode. Do not substitute Linux syscall numbers: the educational service table is a simulator-specific interface, not the general operating system ABI.

### Inspect individual instructions
`li` and `move` are commonly assembler pseudoinstructions. `sll` shifts a register left by one bit; for this positive input it doubles the value. Look at an assembly listing to see any expansion and trace register values after each step. Distinguish the source instruction count from executed machine instructions when making measurements.

### Boundary and failure conditions
Change the input from 3 to 0 and -1. Explain why shifts over signed two's-complement representations should be reasoned about as bit operations, not blindly treated as multiplication for every extreme value. Deliberately mistype a register name and record an assembler diagnostic; that error is different from executing a valid instruction with an incorrect result.

### Independent exercise
Write a loop that sums the integers 1 through 5, using a branch, a counter and a sum register. Trace the first and last branch decisions and prove the expected result of 15. Document whether the simulator models delay slots and how that changes the instruction trace. Reference: https://www.cs.cornell.edu/courses/cs3410/2008fa/MIPS_Vol2.pdf
