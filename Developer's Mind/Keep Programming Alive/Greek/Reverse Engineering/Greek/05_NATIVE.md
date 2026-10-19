# Disassembly και ψευδοκώδικας

## Βασική έννοια

Τα native εκτελέσιμα έχουν εντολές μηχανής. Ο decompiler δίνει προσέγγιση, αφού ο compiler μπορεί να σβήσει ονόματα και να αναδιοργανώσει κλήσεις.

## Χωρίς AI: πράξη

Κάνε compile δικό σου C πρόγραμμα με if/else σε δύο optimization levels. Σύγκρινε πηγαίο, αποτέλεσμα και όποια offline εργαλεία διαθέτεις.

## Επαλήθευση

Εντόπισε στατικό branch χωρίς να ισχυριστείς ότι εκτελείται πάντα.

## Προαιρετικά με AI

Δώσε επιλεγμένες assembly εντολές στο AI και σύγκρινε την εξήγηση με τον δικό σου πηγαίο κώδικα.

## Πρακτικό διάβασμα στο Ghidra
Σε μικρό εκτελέσιμο που μετέφρασες εσύ, σημείωσε compiler, flags και SHA-256. Άνοιξέ το σε νέο project, επιβεβαίωσε τη σωστή αρχιτεκτονική και εκτέλεσε την αρχική ανάλυση. Από Symbol Tree πήγαινε στην `main`/entry, ακολούθησε cross-references και εντόπισε λειτουργίες εισόδου/εξόδου. Σύγκρινε Listing (πραγματικές εντολές), Function Graph (κλάδους), Decompiler (προσεγγιστικό C-like κείμενο). **Ο decompiler κάνει ανακατασκευή**, δεν επιστρέφει τον αρχικό κώδικα.

**Δική σου άσκηση C:**
```c
#include <stdio.h>
int classify(unsigned n) { return n > 100 ? 2 : n > 0 ? 1 : 0; }
int main(void) { printf("%d\\n", classify(42)); }
```
Μετάφρασέ το με debug symbols και με optimization. Βρες ποια σύγκριση ελέγχει το `n > 100`· δες αν η σταθερά 42 επιτρέπει απλοποίηση. Μετονομασίες στον decompiler είναι σημειώσεις ερευνητή, όχι τα αρχικά ονόματα.

**Επαλήθευση:** δοκίμασε τις εισόδους 0, 1, 100, 101, κατέγραψε πρόβλεψη και αποτέλεσμα. Πηγή: NSA Ghidra Beginner guide, https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/GhidraClass/Beginner.

## Από πηγαίο κώδικα σε πραγματική ροή εντολών

Κάνε compile μόνο πρόγραμμα που δημιούργησες εσύ. Ένα απλό και ένα optimized build μπορεί να δίνουν ίδια έξοδο αλλά εντελώς διαφορετικό assembly.

~~~c
#include <stdio.h>
int band(unsigned x) {
    if (x == 0) return 0;
    if (x <= 9) return 1;
    return 2;
}
int main(void) { printf("%d\n", band(12)); }
~~~

Σε desktop Linux με compiler:

~~~sh
cc -g -O0 band.c -o band-debug
cc -g -O2 band.c -o band-opt
file band-debug band-opt
objdump -d band-debug
objdump -d band-opt
~~~

Στο Ghidra εισήγαγε χωριστά τα δύο binaries, επιβεβαίωσε αρχιτεκτονική και entry point, εντόπισε τη συνάρτηση band και κατέγραψε τις διακλαδώσεις. Για εισόδους 0, 1, 9, 10 και 255 γράψε προβλεπόμενη έξοδο, πραγματική έξοδο και σχετικό basic block. Ο optimizer μπορεί να ενώσει ή να αφαιρέσει branches. Δεν υπάρχει αναγκαστικά αντιστοιχία μίας γραμμής C με μία εντολή μηχανής.

Οι ονομασίες που προσθέτεις στο decompiler είναι δικές σου υποθέσεις. Αν το κινητό δεν διαθέτει κατάλληλο disassembler, κάνε εκεί τα tests πηγαίου κώδικα και δήλωσε τον περιορισμό. Πηγή: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/GhidraClass/Beginner.

**Επιτυχία:** εξηγείς μια διακλάδωση με basic block και πραγματικά δεδομένα, αναφέροντας μία αβεβαιότητα του decompiler.
