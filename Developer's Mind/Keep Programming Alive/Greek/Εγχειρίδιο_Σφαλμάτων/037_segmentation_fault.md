# Segmentation fault: απομόνωση προβλήματος μνήμης

## Αναγνώριση της πραγματικής αποτυχίας
Το segmentation fault είναι μη έγκυρη πρόσβαση μνήμης. Σε C/C++ μπορεί να οφείλεται σε pointer, out-of-bounds, use-after-free ή stack exhaustion. Το σημείο crash δεν είναι πάντα η αρχική αιτία αλλοίωσης.

## Ασφαλής αρχικός έλεγχος
~~~sh
cc -g -O0 -Wall -Wextra -fsanitize=address,undefined demo.c -o demo
./demo
~~~

## Διόρθωση αιτίας χωρίς παράκαμψη προειδοποίησης
Χρησιμοποίησε sanitizers όπου υποστηρίζονται ή debugger με symbols και μικρό repro. Μίκρυνε την είσοδο και έλεγξε τον τελευταίο έγκυρο δείκτη. Τα sanitizer builds έχουν overhead και δεν αποτελούν αυτόματη ρύθμιση production. Η απουσία warnings δεν εγγυάται memory safety.

**Τεκμηρίωση:** https://clang.llvm.org/docs/AddressSanitizer.html

## Μικρό, ελεγχόμενο παράδειγμα ορίων
Το stack trace δείχνει πού εντοπίστηκε το πρόβλημα, όχι απαραίτητα πού αλλοιώθηκε πρώτη φορά η μνήμη. Φτιάξε ένα προσωρινό `demo.c`:
~~~c
#include <stdio.h>
int main(void) {
    int values[3] = {10, 20, 30};
    for (size_t i = 0; i < sizeof values / sizeof values[0]; ++i)
        printf("%d\n", values[i]);
    return 0;
}
~~~
Σε compiler με υποστήριξη sanitizers, χτίσε με `cc -std=c11 -g -O0 -Wall -Wextra -fsanitize=address,undefined demo.c -o demo` και εκτέλεσε το προσωρινό αρχείο. Η σωστή έξοδος είναι τρεις γραμμές: `10`, `20`, `30`. Σε απομονωμένο test, η αλλαγή της συνθήκης `i < 3` σε `i <= 3` δημιουργεί πρόσβαση στο άκυρο index 3 και μπορεί να αναφερθεί από AddressSanitizer. Μην κάνεις σκόπιμα λανθασμένες native δοκιμές σε σημαντικό περιβάλλον.

## Πώς βρίσκεις την πραγματική αιτία
Χώρισε το περιστατικό σε τέσσερις κατηγορίες: δείκτης `NULL` ή χαλασμένη διεύθυνση, προσπέλαση εκτός ορίων, χρήση μετά το `free`, υπερχείλιση stack. Στο use-after-free κατέγραψε ποιος κώδικας δεσμεύει και αποδεσμεύει την περιοχή και ποιοι δείκτες εξακολουθούν να την αναφέρουν. Μια αλλαγή στο `printf` μπορεί να μετακινήσει το crash χωρίς να διορθώσει τη μνήμη.

## Πλατφόρμες και απόδειξη
Σε Termux/Android η υποστήριξη sanitizer και debugger εξαρτάται από toolchain και αρχιτεκτονική· σε Linux χρησιμοποίησε τις δυνατότητες του διαθέσιμου clang/gcc. Σύγκρινε debug και release build, κράτα μικρό input που αναπαράγει το bug και επανέλεγξε με την ίδια ακριβώς είσοδο μετά τη διόρθωση. Ένα build χωρίς warnings δεν αποδεικνύει ότι δεν υπάρχουν memory bugs.
