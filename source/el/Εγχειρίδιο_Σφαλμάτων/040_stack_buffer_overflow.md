# Stack buffer overflow — έλεγχος ορίων και διατήρηση της εξόδου σε αποτυχία

## Τι σημαίνει η αποτυχία
Το stack-buffer-overflow είναι πρόσβαση έξω από τα όρια τοπικού πίνακα που αποθηκεύεται στη στοίβα. Συχνό λάθος είναι να θεωρούμε ότι ένα buffer οκτώ byte χωρά οκτώ ορατούς χαρακτήρες, ξεχνώντας το τελικό NUL. Η αντικατάσταση της strcpy με memcpy χωρίς έλεγχο μεγέθους δεν διορθώνει το πρόβλημα: η διαθέσιμη χωρητικότητα αποτελεί υποχρεωτικό μέρος του συμβολαίου.

## Ελεγχόμενη λύση
Γράψε βοηθητική συνάρτηση που λαμβάνει την πραγματική χωρητικότητα του προορισμού και ελέγχει το strlen(source) πριν αντιγράψει. Το παράδειγμα έχει τοπικό πίνακα οκτώ byte: κείμενο επτά χαρακτήρων επιτρέπεται, οκτώ χαρακτήρες απορρίπτονται χωρίς να αλλοιωθεί η προηγούμενη τιμή, και το κενό κείμενο τελειώνει σε έγκυρο NUL. Καμία δοκιμή δεν γράφει σκόπιμα εκτός ορίων.

## Παράδειγμα κώδικα
Αποθήκευσε ως stack_buffer_lab.c.

~~~c
#include <stdio.h>
#include <string.h>
static int copy_label(char dest[8], size_t capacity, const char *source) {
    if (!dest || !source || capacity == 0) return -1;
    size_t n = strlen(source);
    if (n >= capacity) return -2; /* account for the final NUL */
    memcpy(dest, source, n + 1);
    return 0;
}
int main(void) {
    char small[8] = {0};
    if (copy_label(small, sizeof small, "example") != 0) return 1;
    if (strcmp(small, "example") != 0) return 2;
    if (copy_label(small, sizeof small, "12345678") != -2) return 3;
    if (strcmp(small, "example") != 0) return 4;
    if (copy_label(small, sizeof small, "") != 0) return 5;
    if (strcmp(small, "") != 0) return 6;
    puts("PASS: exact fit, rejected long input, unchanged buffer");
}
~~~

## Γιατί λειτουργεί
Η πηγή πρέπει να είναι έγκυρη, τερματισμένη συμβολοσειρά C. Η strlen σε εσφαλμένο ή μη τερματισμένο δείκτη μπορεί ήδη να προκαλέσει ανάγνωση εκτός ορίων. Ακατέργαστα ή μη έμπιστα δεδομένα χρειάζονται ρητό μήκος εισόδου. Στην C, παράμετρος char dest[8] μετατρέπεται σε δείκτη μέσα στη συνάρτηση, άρα το sizeof dest εκεί δεν επιστρέφει οκτώ. Γι' αυτό ο καλών μεταφέρει ρητά το sizeof small.

## Ασφαλής επαλήθευση
Μεταγλώττισε gcc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -g stack_buffer_lab.c -o stack_buffer_lab && ./stack_buffer_lab. Αναμενόμενη έξοδος PASS. Αν δεν υπάρχει sanitizer δήλωσε ότι ο έλεγχος είναι πιο περιορισμένος.

## Άσκηση και αποδεικτικά
Πρόσθεσε προορισμό ενός byte, μηδενική χωρητικότητα και κενό δείκτη χωρίς να τον προσπελάσεις. Εξήγησε γιατί η αποτυχία δεν πρέπει να αλλάζει μέρος της εξόδου. Δώσε χωρητικότητα 7 αντί για sizeof small και διαπίστωσε ότι η επτά χαρακτήρων είσοδος απορρίπτεται. Οι έλεγχοι ορίων είναι απαραίτητοι ανεξάρτητα από stack ή heap.

**Πρωτογενής τεκμηρίωση:** https://clang.llvm.org/docs/AddressSanitizer.html
