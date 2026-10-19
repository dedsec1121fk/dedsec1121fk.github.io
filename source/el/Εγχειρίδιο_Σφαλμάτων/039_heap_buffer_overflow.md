# Heap buffer overflow — ακριβές μέγεθος δέσμευσης και ασφαλής αντιγραφή

## Τι σημαίνει η αποτυχία
Το heap-buffer-overflow εμφανίζεται όταν ένα πρόγραμμα διαβάζει ή γράφει έξω από το δεσμευμένο δυναμικό buffer. Συνηθισμένες αιτίες είναι η δέσμευση strlen(source) byte ενώ η αντιγραφή περιλαμβάνει και το τελικό NUL, η εμπιστοσύνη σε ανεξέλεγκτα μεγέθη και η υπερχείλιση στην αριθμητική size_t. Η αλλοίωση μνήμης μπορεί να φανεί αρκετά αργότερα, επομένως η απουσία crash δεν αποτελεί απόδειξη ασφάλειας.

## Ελεγχόμενη λύση
Υλοποίησε συνάρτηση αντιγραφής με έναν ιδιοκτήτη και όριο 32 byte περιεχομένου. Η malloc πρέπει να δεσμεύει n+1 byte για το τελικό NUL. Μεγαλύτερη είσοδος απορρίπτεται πριν τη δέσμευση και ο δείκτης εξόδου παραμένει NULL. Οι δοκιμές χρησιμοποιούν ελεγχόμενα τεχνητά κείμενα με σωστό τερματισμό.

## Παράδειγμα κώδικα
Αποθήκευσε ως heap_buffer_lab.c.

~~~c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int copy_text(const char *source, char **out) {
    if (!source || !out) return -1;
    *out = NULL;
    size_t n = strlen(source);
    if (n > 32) return -2;  /* policy cap also prevents n+1 overflow */
    char *buffer = malloc(n + 1);
    if (!buffer) return -3;
    memcpy(buffer, source, n + 1);
    *out = buffer;
    return 0;
}
int main(void) {
    char *result = NULL;
    if (copy_text("hello", &result) != 0) return 1;
    if (strcmp(result, "hello") != 0) return 2;
    free(result);
    result = NULL;
    if (copy_text("012345678901234567890123456789012", &result) != -2 || result != NULL) return 3;
    if (copy_text("", &result) != 0 || strcmp(result, "") != 0) return 4;
    free(result);
    puts("PASS: exact allocation, upper bound, empty string");
}
~~~

## Γιατί λειτουργεί
Το σταθερό ανώτατο όριο αποτρέπει την υπερχείλιση του n+1 και περιορίζει τη μνήμη. Ελέγχουμε κανονικό κείμενο, 33 byte που απορρίπτονται και κενή συμβολοσειρά που απαιτεί ένα byte για NUL. Η strlen προϋποθέτει ότι η πηγή είναι έγκυρη και τερματισμένη. Για μη έμπιστα ακατέργαστα byte χρειάζεται ρητή παράμετρος μήκους και έλεγχος διαθέσιμης μνήμης. Η calloc δεν διορθώνει λανθασμένο μέγεθος και η memcpy δεν ελέγχει όρια.

## Ασφαλής επαλήθευση
Μεταγλώττισε με gcc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -g heap_buffer_lab.c -o heap_buffer_lab && ./heap_buffer_lab. Η επιτυχημένη εκτέλεση με sanitizer καλύπτει μόνο τις διαδρομές που δοκιμάστηκαν.

## Άσκηση και αποδεικτικά
Άλλαξε το όριο σε 16 και βεβαιώσου ότι 17 byte απορρίπτονται. Εξήγησε γιατί η δέσμευση μόνο n byte δεν επαρκεί. Κατάγραψε την απαίτηση να μην επικαλύπτονται η μεταβλητή εξόδου και η μνήμη προέλευσης. Αποθήκευσε τα αναμενόμενα και πραγματικά αποτελέσματα για κάθε όριο.

**Πρωτογενής τεκμηρίωση:** https://clang.llvm.org/docs/AddressSanitizer.html
