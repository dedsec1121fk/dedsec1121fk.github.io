# llvm_ir — consolidated language guide

## LLVM IR

### Working model
LLVM IR is a typed intermediate representation used by compiler toolchains, not a portable assembly language for direct execution on hardware.

### Focused source example
```text
define i32 @add(i32 %a, i32 %b) {
entry:
  %sum = add i32 %a, %b
  ret i32 %sum
}
```

Identify the function signature, named basic block and SSA value. Compare verifier acceptance of a correct return type with an intentionally mismatched one.

### Evidence to collect
Record the exact LLVM_IR compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
An IR file's syntax and supported attributes vary by LLVM version; verify with tools from the same release.

## LLVM IR: applied exercises

### Run the provided module
The companion `00_starter.ll` defines `i32 @main()` and returns `i32 0`. Work on a copied `exercise.ll`, leaving the starter untouched. With compatible LLVM command-line tools installed:

~~~sh
llvm-as exercise.ll -o exercise.bc
lli exercise.bc
printf 'exit status: %s\n' "$?"
~~~

An ordinary successful run should exit with status zero. `lli` executes the module; it does not print the returned integer as text. Record `llvm-as --version` and `lli --version`; version mismatch can explain parser failures. This recipe has not been executed here.

### Predict an observable change
Change only `ret i32 0` to `ret i32 7`, assemble again, and predict a shell status of `7` on an environment that runs `main` as the entry point. Do not assert that the shell can preserve arbitrary 32-bit exit values: operating systems commonly expose only a limited exit-status range. For a return value visible without a shell, a separate call harness is better than relying on `$?`.

### Deliberate type mismatch
In a disposable copy, replace the terminator with `ret i64 7` while keeping `define i32 @main()`. LLVM IR uses explicitly typed instructions; the function's return type and `ret` operand type must agree. Run `llvm-as`, keep the actual diagnostic, then restore `ret i32 7`. Do not solve the mismatch by changing random integers until the assembler accepts the file.

### Control-flow experiment
Construct a second version with blocks `entry`, `positive` and `nonpositive`. Compare an `icmp sgt i32` result with zero, branch using `br i1`, and ensure **each** reachable block ends in a terminator. Make every return `i32`; if you instead merge branches using `phi`, supply one incoming value per predecessor. Inspect with `llvm-dis` to see the instruction structure.

### Independent review
Explain why `i32` is part of the semantic contract, why a basic block cannot silently fall through, and why assembling is not the same as executing. Record one valid result, one invalid type result, the LLVM version and any target limitations. Reference: https://llvm.org/docs/LangRef.html
