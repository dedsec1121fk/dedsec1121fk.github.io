# c — συγκεντρωτικός οδηγός

## C

**Συνήθης χρήση:** Προγραμματισμός συστημάτων.

**Προτεινόμενη επέκταση αρχείου:** `.c`.

**Εκτέλεση / περιβάλλον:** cc main.c -o main && ./main.

### Αρχικό παράδειγμα

```
#include <stdio.h>
void greet(const char *name) { printf("Hello, %s!\n", name); }
int main(void) { greet("Ada"); return 0; }
```

### Πώς διαβάζεται

Στις εφαρμογές πρόσεχε τη διάρκεια ζωής δεικτών και τον έλεγχο σφαλμάτων.

### Συνηθισμένο λάθος

Στις εφαρμογές πρόσεχε τη διάρκεια ζωής δεικτών και τον έλεγχο σφαλμάτων. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Μνήμη και ασφαλές parsing στην C
Στη C ο προγραμματιστής διαχειρίζεται buffers και lifetimes. Ένα string τελειώνει σε NUL, ένα packet buffer όχι υποχρεωτικά. Μην μετατρέπεις τυχαία bytes κατευθείαν σε pointer σε struct: alignment, padding και endianness μπορεί να διαφέρουν.
```c
#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
bool decode_u16_le(const uint8_t *data, size_t len, uint16_t *out) {
    if (!data || !out || len < 2) return false;
    *out = (uint16_t)data[0] | ((uint16_t)data[1] << 8);
    return true;
}
```
Κάνε build δικού σου προγράμματος με diagnostics όπως `cc -std=c11 -Wall -Wextra -Wconversion -g -fsanitize=address,undefined test.c` όπου υποστηρίζονται. Σύγκρινε stack storage και `malloc`, κάνε `free` μία φορά σε κάθε σωστό path. Το pointer+length είναι καλύτερο συμβόλαιο από γυμνό pointer.

**Εργαστήριο:** parser length-prefixed εγγραφής με tests για κενό, μικρό header, ακριβές μήκος, υπερβολικό count. Πηγή: https://en.cppreference.com/w/c.

### C: ασφαλής προσπέλαση buffer με πραγματικά tests

Η C δίνει άμεση πρόσβαση σε μνήμη· ο προγραμματιστής ελέγχει όρια και διάρκεια ζωής. Ο παρακάτω decoder διαβάζει 16-bit little-endian τιμή χωρίς να ξεπερνά το διαθέσιμο μήκος:

~~~c
#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
bool read_u16le(const unsigned char *p, size_t n, uint16_t *out) {
    if (!p || !out || n < 2) return false;
    *out = (uint16_t)p[0] | ((uint16_t)p[1] << 8);
    return true;
}
~~~

Δημιούργησε array με 0x34, 0x12. Αναμενόμενη τιμή είναι 0x1234 (4660). Δοκίμασε μήκος 0, 1 και 2: μόνο η τρίτη δοκιμή μπορεί να πετύχει. Δοκίμασε επίσης null output pointer. Η μετατροπή πριν από το shift αποφεύγει ασάφειες του απλού char.

Κάνε compile δικό σου test με warnings και, όπου υποστηρίζεται, sanitizers: cc -Wall -Wextra -Wpedantic -g -fsanitize=address,undefined test.c -o test. Η υποστήριξη διαφέρει σε compiler/συσκευή. Η απουσία crash σε μία δοκιμή δεν αποδεικνύει ασφάλεια μνήμης.

Κατέγραψε χωρητικότητα allocated buffer, πραγματικό μήκος και έγκυρο εύρος. Για κάθε API με pointer και size, το size είναι μέρος της σύμβασης. Προτίμησε size_t για μήκη και πρόσεχε μετατροπές αρνητικών τιμών σε unsigned.

**Επιτυχία:** σωστό αποτέλεσμα little-endian και ασφαλής απόρριψη μικρής ή null εισόδου.

## C — Αναλυτικός οδηγός εξάσκησης

### Γιατί όχι atoi
Η atoi δεν αναφέρει με αξιόπιστο τρόπο όλα τα σφάλματα. Η strtol παρέχει end pointer, errno και δυνατότητα ρητού ελέγχου εύρους. Η συνάρτηση επιστρέφει σημαία επιτυχίας και γράφει στο output pointer μόνο αφού επικυρώσει το αποτέλεσμα.

### Μεταγλώττιση
Αποθήκευσε main.c και τρέξε gcc -std=c11 -Wall -Wextra -pedantic main.c -o parser && ./parser. Περιμένεις C parser OK. Μην ορίσεις NDEBUG στο συγκεκριμένο test, γιατί τότε τα assert απενεργοποιούνται.

~~~c
#include <assert.h>
#include <ctype.h>
#include <errno.h>
#include <stdlib.h>
#include <stdio.h>
static int parse_port(const char *s, int *out) {
    if (s == NULL || out == NULL) return 0;
    char *end;
    errno = 0;
    long n = strtol(s, &end, 10);
    if (s == end || errno == ERANGE) return 0;
    while (isspace((unsigned char)*end)) ++end;
    if (*end != '\0' || n < 1 || n > 65535) return 0;
    *out = (int)n;
    return 1;
}
int main(void) {
    int result = 0;
    assert(parse_port(" 8080 ", &result) && result == 8080);
    assert(!parse_port("abc", &result));
    assert(!parse_port("65536", &result));
    assert(!parse_port(NULL, &result));
    puts("C parser OK");
    return 0;
}
~~~

### Ανάλυση προστασιών
Το s==end σημαίνει ότι δεν βρέθηκε αρχικό αριθμητικό τμήμα. Το errno==ERANGE εντοπίζει overflow ή underflow. Ο βρόχος επιτρέπει κενά μετά τον αριθμό αλλά όχι επιπλέον κείμενο. Η μετατροπή σε unsigned char προστατεύει την προϋπόθεση της isspace. Τα NULL pointers ελέγχονται πριν την πρόσβαση.

### Ασκήσεις
Δοκίμασε άδειο κείμενο, μόνο κενά, -1, +5, 0x10 με βάση 10 και πολύ μεγάλο αριθμό. Γράψε δεύτερη υλοποίηση που επιτρέπει μόνο ψηφία χωρίς πρόσημο. Αν υποστηρίζονται, χρησιμοποίησε -fsanitize=address,undefined -fno-omit-frame-pointer και εξήγησε τους περιορισμούς του compiler.

### Διάγνωση
Το segmentation fault δεν είναι συνηθισμένο αποτέλεσμα αποτυχημένης επικύρωσης. Ενεργοποίησε warnings και μίκρυνε την αναπαραγωγή. Σε Termux ένα toolchain clang μπορεί να είναι διαθέσιμο αντί για το gcc του desktop.
Επιτυχία: απόρριψη λαθών χωρίς dereference NULL. https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf.html

## C — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `cc -std=c11 -Wall -Wextra -pedantic {file} -o demo && ./demo`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## C — Διαδρομή ουσιαστικής εξάσκησης

### Πρωτόκολλο και υπόθεση μνήμης
Μια κεφαλίδα δύο bytes περιγράφει big-endian μη προσημασμένο μήκος payload. Πριν διαβάσεις input[0] ή input[1], πρέπει να γνωρίζεις ότι size >= 2. Το παρακάτω αποφεύγει μη φορητό cast σε struct, του οποίου το alignment και padding μπορεί να διαφέρουν.

~~~c
#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>

bool payload(const uint8_t *input, size_t size,
             const uint8_t **start, size_t *len) {
    if (!input || !start || !len || size < 2) return false;
    size_t n = ((size_t)input[0] << 8) | input[1];
    if (n > size - 2) return false;
    *start = input + 2;
    *len = n;
    return true;
}
~~~

Η σύγκριση n > size - 2 είναι ασφαλής επειδή έχει ήδη αποδειχθεί size >= 2. Αν συνέκρινες άκριτα n+2 με size, ένα γενικευμένο αριθμητικό μήκος θα μπορούσε να υπερχειλίσει σε unsigned addition. Η συνάρτηση επιστρέφει view του input, όχι νέο αντίγραφο.

### Οριακές περιπτώσεις
Δοκίμασε μέγεθος 0, 1 και 2 bytes, κεφαλίδα 00 03 με ακριβώς τρία payload bytes και κεφαλίδα 00 04 με μόνο τρία. Στην τελευταία περίπτωση ο parser οφείλει να επιστρέψει false χωρίς dereference πέρα από το buffer. Οι output pointers μένουν ανέπαφοι σε αποτυχία, άρα ο caller δεν πρέπει να τους διαβάζει ως δήθεν νέα τιμή.

### Ownership και lifetime
Ο returned pointer δείχνει στη μνήμη που παρείχε ο caller. Δεν μπορεί να γίνει free(start) επειδή δεν έγινε malloc για αυτόν. Ο pointer παύει να είναι έγκυρος αν αποδεσμευτεί ή αλλάξει η υποκείμενη μνήμη. Σχεδίασε αντιπαράδειγμα όπου ο caller κρατά τον pointer μετά το free, αλλά μην εκτελέσεις μη ασφαλή χρήση εκτός κατάλληλου sanitizer harness.

### Απόδειξη συμπεριφοράς
Πρόσθεσε tests με ASan/UBSan όταν υποστηρίζονται και ένα ανεξάρτητο όριο πολιτικής, π.χ. μέγιστο επιτρεπτό payload 4096 bytes. Τα sanitizers είναι ενδείξεις για εκτελεσμένες διαδρομές και όχι μαθηματική απόδειξη απουσίας λαθών. Κατάγραψε compiler, flags και αποτελέσματα αντί να χαρακτηρίζεις «tested» κώδικα που δεν εκτέλεσες.

## C — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Τα όρια πινάκων δεν ελέγχονται αυτόματα στις συνήθεις πράξεις δεικτών.
2. Όρισε σαφή ιδιοκτησία δυναμικής μνήμης και ελευθέρωσέ την ακριβώς μία φορά.
3. Έλεγξε επιστροφές και μήκη εξωτερικών δεδομένων· απόφυγε μη οριοθετημένες λειτουργίες κειμένου.

## Ada

**Συνήθης χρήση:** Προγραμματισμός συστημάτων.

**Προτεινόμενη επέκταση αρχείου:** `.adb`.

**Εκτέλεση / περιβάλλον:** gnatmake hello.adb && ./hello.

### Αρχικό παράδειγμα

```
with Ada.Text_IO; use Ada.Text_IO;
procedure Hello is
begin
   Put_Line("Hello, Ada!");
end Hello;
```

### Πώς διαβάζεται

Η Ada δίνει έμφαση στους ισχυρούς τύπους και στα συμβόλαια.

### Συνηθισμένο λάθος

Η Ada δίνει έμφαση στους ισχυρούς τύπους και στα συμβόλαια. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## Ada — Αναλυτικός οδηγός εξάσκησης

### Πραγματικό αρχικό δείγμα
~~~text
with Ada.Text_IO; use Ada.Text_IO;
procedure Hello is
begin
   Put_Line("Hello, Ada!");
end Hello;
~~~

**Περιβάλλον:** gnatmake hello.adb && ./hello.. Επιβεβαίωσε ότι έχεις το σωστό compiler, host ή simulator πριν θεωρήσεις την έξοδο αξιόπιστη. Για scripts με πρόσβαση σε προσωπικά αρχεία ή ρυθμίσεις, χρησιμοποίησε προσωρινά και read-only δεδομένα.

### Συγκεκριμένος στόχος υλοποίησης
Όρισε constrained integer subtype και απόρριψε τιμή εκτός εύρους. Σύγκρινε compile-time subtype rules με runtime Constraint_Error.

### Κρίσιμο λάθος που πρέπει να αναγνωρίζεις
Ada range checks εξαρτώνται από build options και SPARK proof δεν είναι απλή Ada μεταγλώττιση.

## Ada — Διαδρομή ουσιαστικής εξάσκησης

### Μία απλή δέσμευση εύρους
Η Ada επιτρέπει τη δήλωση subtype με συγκεκριμένα όρια. Αυτό κάνει την προϋπόθεση του προγράμματος ορατή στον τύπο αλλά δεν σημαίνει ότι κάθε τιμή εκτός ορίων θα απορριφθεί υποχρεωτικά στη φάση compilation: πολλές παραβιάσεις αναγνωρίζονται κατά την εκτέλεση.

~~~ada
with Ada.Text_IO; use Ada.Text_IO;
procedure Range_Demo is
   subtype Percentage is Integer range 0 .. 100;
   Current : Percentage := 30;
begin
   Current := Current + 10;
   Put_Line(Integer'Image(Current));
end Range_Demo;
~~~

Η αναμενόμενη εκτύπωση είναι 40. Εάν αλλάξεις το αποτέλεσμα σε 130 και το αναθέσεις στο Current, το runtime constraint check μπορεί να εγείρει Constraint_Error. Διάκρινε την περιορισμένη τιμή Percentage από γενικό Integer και σημείωσε γιατί ένας subrange type βοηθά την αναγνωσιμότητα και τα συμβόλαια.

### Contract-oriented άσκηση
Όρισε συνάρτηση Clamp που δέχεται Integer και επιστρέφει Percentage. Αντί να αναθέτεις άκριτα εκτός ορίων τιμές, επέστρεφε 0 για αρνητική είσοδο, 100 για πάνω από το όριο, αλλιώς την ίδια τιμή. Πρόσθεσε Preconditions/Postconditions με γλώσσα Ada 2012 όταν το εργαλείο υποστηρίζει contract aspects.

### Προσοχή στους compiler modes
Το αν ενεργοποιούνται checks, assertions και optimizations εξαρτάται από τις ρυθμίσεις του compiler. Μην θεωρείς ένα pragma Assert εγγυημένο σε όλα τα builds χωρίς να ελέγξεις πώς το χειρίζεται ο GNAT και τα flags του. Οι συμβάσεις API δεν πρέπει να βασίζονται σε αποκλειστικά debug assertions όταν απαιτείται runtime validation σε παραγωγή.

### Διαφορές τιμών και references
Η Ada έχει διαφορετικές κατηγορίες τύπων με διαφορετικά μοντέλα παράμετρων και ownership. Μη γενικεύεις από μικρό Integer example ότι όλα τα αντικείμενα αντιγράφονται πάντοτε με τον ίδιο τρόπο. Διάβασε τις κατηγορίες by-copy/by-reference στον ορισμό της γλώσσας όταν σχεδιάζεις mutable records.

### Παραδοτέο
Τρέξε unit tests για -1, 0, 40, 100, 101 σε Clamp και κατέγραψε αποτελέσματα. Πρόσθεσε άμεση παραβίαση subtype ώστε να διακρίνεις τι αποφασίζει ο compiler από το τι εντοπίζει ο runtime. Σημείωσε έκδοση compiler και options, όχι μόνο «περνάει».

## Odin

**Συνήθης χρήση:** Προγραμματισμός συστημάτων.

**Προτεινόμενη επέκταση αρχείου:** `.odin`.

**Εκτέλεση / περιβάλλον:** odin run hello.odin -file.

### Αρχικό παράδειγμα

```
package main
import "core:fmt"
main :: proc() { fmt.println("Hello, Ada!") }
```

### Πώς διαβάζεται

Η Odin είναι μεταγλωττιζόμενη γλώσσα συστημάτων.

### Συνηθισμένο λάθος

Η Odin είναι μεταγλωττιζόμενη γλώσσα συστημάτων. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## Odin — Αναλυτικός οδηγός εξάσκησης

### Πραγματικό αρχικό δείγμα
~~~text
package main
import "core:fmt"
main :: proc() { fmt.println("Hello, Ada!") }
~~~

**Περιβάλλον:** odin run hello.odin -file.. Επιβεβαίωσε ότι έχεις το σωστό compiler, host ή simulator πριν θεωρήσεις την έξοδο αξιόπιστη. Για scripts με πρόσβαση σε προσωπικά αρχεία ή ρυθμίσεις, χρησιμοποίησε προσωρινά και read-only δεδομένα.

### Συγκεκριμένος στόχος υλοποίησης
Δέσμευσε slice και διέτρεξέ το με bounds checks. Φτιάξε προσωρινή arena allocation και έλεγξε lifetime/context.

### Κρίσιμο λάθος που πρέπει να αναγνωρίζεις
Το allocator/context model της Odin δεν είναι απλό C malloc. Μη γυρίζεις slices προς προσωρινή μνήμη.

## Odin — Διαδρομή ουσιαστικής εξάσκησης

### Ένα typed fixed array
Η Odin στοχεύει σε χαμηλού επιπέδου προγραμματισμό με ρητούς τύπους, arrays και slices. Στο μικρό πρόγραμμα η διάσταση [3]int είναι μέρος του τύπου του πίνακα και οι τιμές είναι γνωστές στο compile time.

~~~odin
package main

import "core:fmt"

main :: proc() {
    values := [3]int{2, 4, 6}
    total := values[0] + values[1] + values[2]
    fmt.println(total)
}
~~~

Η αναμενόμενη εκτύπωση είναι 12. Σύγκρινε αυτόν τον fixed array με slice μεταβλητού μήκους, το οποίο φέρει πληροφορία πλήθους στοιχείων αλλά δεν είναι υποχρεωτικά ιδιοκτήτης της υποκείμενης μνήμης. Για κάθε API που επιστρέφει slice κατέγραψε ποιος διατηρεί τον backing storage ζωντανό.

### Επικύρωση μήκους
Γράψε διαδικασία που δέχεται []int και αθροίζει μόνο τα πρώτα δύο στοιχεία αφού ελέγξει len(values) >= 2. Η indexing πράξη δεν πρέπει να προηγείται του ελέγχου. Δοκίμασε μήκος 0, 1, 2 και 3 και τεκμηρίωσε τι αποτέλεσμα απαιτεί το συμβόλαιό σου σε υπερβολικά μικρή είσοδο.

### Allocators ως τμήμα του σχεδιασμού
Σε systems programming η απόφαση allocator επηρεάζει ownership και lifetime. Διάκρινε ένα προσωρινό allocation που απελευθερώνεται μαζί με arena από ένα resource που πρέπει να επιβιώσει μετά το τέλος της συνάρτησης. Μην επιστρέφεις pointer σε δεδομένα που καταστρέφονται μαζί με το allocator scope.

### Σημασιολογία και σφάλματα
Η Odin δεν αντιμετωπίζει όλα τα σφάλματα όπως exceptions σε δυναμικές γλώσσες. Για input parser σχεδίασε επιστροφή επιτυχίας/αποτυχίας και αποτέλεσμα που ο caller ελέγχει πριν κάνει dereference. Δοκίμασε μη έγκυρο data length σε απομονωμένο unit test, όχι με τυχαία pointers.

### Αποδεικτικά
Κατάγραψε ακριβή Odin compiler version και target platform, πραγματική εκτύπωση του array example και αποτέλεσμα ελέγχων length. Εξήγησε τη διαφορά fixed array και slice χωρίς να αποδώσεις ιδιότητα ιδιοκτησίας εκεί όπου δεν ισχύει.

## WebAssembly Text (WAT)

**Συνήθης χρήση:** Προγραμματισμός συστημάτων.

**Προτεινόμενη επέκταση αρχείου:** `.wat`.

**Εκτέλεση / περιβάλλον:** Επικύρωση με wat2wasm hello.wat.

### Αρχικό παράδειγμα

```
(module
  (func (export "answer") (result i32)
    i32.const 42))
```

### Πώς διαβάζεται

Εξάγει συνάρτηση· απαιτεί περιβάλλον WebAssembly για κλήση.

### Συνηθισμένο λάθος

Εξάγει συνάρτηση· απαιτεί περιβάλλον WebAssembly για κλήση. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## WebAssembly_Text_WAT — Αναλυτικός οδηγός εξάσκησης

### Πραγματικό αρχικό δείγμα
~~~text
(module
  (func (export "answer") (result i32)
    i32.const 42))
~~~

**Περιβάλλον:** Validate via wat2wasm hello.wat.. Επιβεβαίωσε ότι έχεις το σωστό compiler, host ή simulator πριν θεωρήσεις την έξοδο αξιόπιστη. Για scripts με πρόσβαση σε προσωπικά αρχεία ή ρυθμίσεις, χρησιμοποίησε προσωρινά και read-only δεδομένα.

### Συγκεκριμένος στόχος υλοποίησης
Γράψε module WAT με exported add(i32,i32)->i32 και κάνε instantiation τοπικά. Σύγκρινε stack instructions με υψηλού επιπέδου expressions.

### Κρίσιμο λάθος που πρέπει να αναγνωρίζεις
Η WAT είναι textual Wasm, όχι JavaScript· imports/exports/memory pages πρέπει να συμφωνούν με host. Χρησιμοποίησε wat2wasm.

## WebAssembly_Text_WAT — Διαδρομή ουσιαστικής εξάσκησης

### Ένα ελάχιστο module
Η WebAssembly Text Format (WAT) είναι αναγνώσιμη μορφή ενός Wasm module. Σε μια συνάρτηση, οι εντολές εκτελούνται με αυστηρούς stack types, οπότε κάθε αριθμητική πράξη απαιτεί τα σωστά operands.

~~~wat
(module
  (func (export "add") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add
  )
)
~~~

Μπορείς να συναρμολογήσεις το αρχείο με wat2wasm και να καλέσεις το exported add από έναν runtime που υποστηρίζει wasm modules. Για ορίσματα 3 και 5, το αποτέλεσμα αναμένεται να είναι 8. Το σώμα δεν έχει πρόσβαση σε filesystem ή δίκτυο επειδή το module από μόνο του δεν περιγράφει αυτές τις host δυνατότητες.

### Typed stack ως εργαλείο διάγνωσης
Η i32.add καταναλώνει δύο i32 και παράγει ένα i32. Αφαίρεσε ένα local.get για να αφήσεις ανεπαρκές stack και έλεγξε το validation error. Αν αντικαταστήσεις το i32.add με f64.add χωρίς μετατροπή των operands, παραβιάζεται ο τύπος. Δεν πρόκειται για περίεργο runtime bug αλλά για δομική αποτυχία κατά το validation.

### Overflow και sign
Η i32 αριθμητική ακολουθεί 32-bit bitpatterns με wrap στη συνηθισμένη πρόσθεση. Η ερμηνεία signed/unsigned γίνεται σημαντική σε συγκρίσεις, μετατροπές και divisions, όπως i32.div_s έναντι i32.div_u. Σχεδίασε είσοδο 0xffffffff και εξήγησε πώς το ίδιο bitpattern ερμηνεύεται αλλιώς σε κάθε operation.

### Host boundary
Ένα module με imports χρειάζεται host implementation που να παρέχει τις απαιτούμενες συναρτήσεις ή μνήμη. Η χρήση WASI δεν είναι μαγικά διαθέσιμη σε όλα τα browsers ή runtimes. Έλεγξε το host ABI και τις επιτρεπόμενες δυνατότητες πριν ισχυριστείς ότι το ίδιο binary λειτουργεί χωρίς αλλαγές παντού.

### Εργαστήριο
Εκτέλεσε validation του έγκυρου και ενός άκυρου WAT module, καταγράψε wat2wasm και runtime versions και πρόσθεσε exported multiplication function. Χρησιμοποίησε τρία ζεύγη τιμών και δήλωσε τι πραγματικά δοκιμάστηκε. Η παρουσιαζόμενη πρόβλεψη add(3,5)=8 δεν είναι ισχυρισμός ότι έχει γίνει εκτέλεση εδώ.