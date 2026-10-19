# Linux x86-64 assembly: καταχωρητές, μήκη και τερματισμός

## Συγκεκριμένο περιβάλλον
Το παράδειγμα χρησιμοποιεί NASM syntax, ELF64 objects και Linux x86-64 syscall ABI. Δεν είναι Android ARM64, Windows x64 ή macOS assembly. Ένα ARM κινητό δεν το εκτελεί native επειδή διαθέτει Termux. Έλεγξε αρχιτεκτονική πριν επιλέξεις assembler.

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

## Assembly και linking
Σε άδειο directory με NASM και συμβατό Linux linker αποθήκευσε hello.asm και εκτέλεσε:
~~~sh
nasm -f elf64 hello.asm -o hello.o
ld hello.o -o hello
./hello
printf 'exit=%s\n' "$?"
~~~
Αναμενόμενη έξοδος: `Hello, Ada!` και newline, έπειτα exit=0. Είναι πρόβλεψη μέχρι να δοκιμαστεί σε συμβατό toolchain. Το `_start` είναι process entry label και όχι C main. Ο linker δημιουργεί executable από το relocatable object.

## Σύμβαση καταχωρητών
Για write, το eax επιλέγει syscall 1, το edi ορίζει stdout, το rsi δείχνει τα bytes και το edx δίνει το μήκος. Ο assembler υπολογίζει byte count από τη διαφορά της τρέχουσας θέσης με το message label. Για exit, eax=60 και το edi δίνει exit status. Το xor edi,edi παράγει status μηδέν. Η C function-call convention και η syscall convention είναι διαφορετικές συμβάσεις, ακόμη κι όταν επικαλύπτονται ορισμένοι argument registers.

## Οριακές περιπτώσεις
Άλλαξε το exit status σε 7 και δες το shell αποτέλεσμα αμέσως μετά την εκτέλεση, πριν άλλη εντολή το αντικαταστήσει. Μείωσε το byte count κατά ένα και πρόβλεψε την απουσία newline. Μην υπερβείς το πραγματικό buffer, γιατί μπορεί να διαβαστεί άσχετη μνήμη. Το ελάχιστο πρόγραμμα δεν χειρίζεται write errors ή short writes και δεν είναι γενική ανθεκτική ρουτίνα εξόδου.

Κράτησε source, hashes object/executable, έκδοση assembler και αρχιτεκτονική. Το disassembly επιβεβαιώνει προετοιμασία registers, όχι από μόνο του επιτυχημένη εκτέλεση.

Πηγές: [NASM output formats](https://www.nasm.us/doc/nasm09.html), [Linux syscall conventions](https://man7.org/linux/man-pages/man2/syscall.2.html).
