# Linux x86-64 assembly: registers, lengths and process exit

## Exact environment
This example uses NASM syntax, ELF64 objects and the Linux x86-64 syscall ABI. It is not Android ARM64 assembly, Windows x64 code or macOS assembly. A phone with an ARM CPU cannot execute it natively merely because Termux offers a shell. Check the target architecture before choosing an assembler.

~~~nasm
global _start
section .data
message db "Hello, Ada!", 10
message_size equ $ - message
section .text
_start:
    mov eax, 1
    mov edi, 1
    lea rsi, [rel message]
    mov edx, message_size
    syscall
    mov eax, 60
    xor edi, edi
    syscall
~~~

## Assemble and link
In an empty work directory with NASM and a compatible Linux linker, save the code as hello.asm and run:
~~~sh
nasm -f elf64 hello.asm -o hello.o
ld hello.o -o hello
./hello
printf 'exit=%s\n' "$?"
~~~
Expected output is `Hello, Ada!` followed by a newline, then exit=0. This is a prediction unless the matching toolchain was actually used. `_start` is the process entry label here, not a C main function. The linker supplies the executable structure from the relocatable object.

## Read the register contract
For write, eax selects syscall 1, edi identifies stdout, rsi points to the byte buffer and edx gives its byte count. The assembler computes the count from the difference between the current location and the message label. For exit, eax is 60 and edi holds the exit status. Zeroing edi supplies status zero. The C function-call register convention and the syscall convention are different contracts, even when some argument registers overlap.

## Boundaries worth testing
Change the exit status to 7 and inspect the shell result immediately after running the program, before another command overwrites it. Change the byte count to one less than the message size and predict the missing newline. Do not make the count exceed the actual buffer: that could read unrelated memory. The minimal example omits production-quality write error and short-write handling, so printing one message is not a robust general output loop.

Keep the source, object/executable hashes, assembler version and architecture together. Disassembly can confirm the register setup, but cannot by itself prove that the process ran successfully.

References: [NASM output formats](https://www.nasm.us/doc/nasm09.html), [Linux syscall conventions](https://man7.org/linux/man-pages/man2/syscall.2.html).
