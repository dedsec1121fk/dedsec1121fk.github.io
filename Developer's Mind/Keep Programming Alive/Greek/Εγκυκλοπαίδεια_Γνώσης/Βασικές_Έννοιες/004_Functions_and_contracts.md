# Συναρτήσεις, αναλλοίωτες συνθήκες, αναδρομή και διαχείριση σφαλμάτων

## Συναρτήσεις και συμβόλαια

### Αρχή σχεδιασμού
Function contract ορίζει έγκυρα inputs, outputs, errors και side effects. Type hints δεν επιβάλλουν numeric ranges ή permissions· εξωτερικά inputs χρειάζονται runtime validation.

### Πρακτική περίπτωση
~~~python
def percent(part,total):
    if total<=0 or not 0<=part<=total: raise ValueError('range')
    return 100*part/total
assert percent(2,4)==50
~~~

### Ανεξάρτητη άσκηση
Δοκίμασε total=0 και part>total. Επιβεβαίωσε σαφή exception στον caller και αποφάσισε αν επιτρέπονται decimals.

### Τεκμήρια για review
Για Functions and contracts, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Επαναλήψεις και αμετάβλητες συνθήκες

### Αρχή σχεδιασμού
Loop invariant ισχύει πριν από κάθε επανάληψη και διατηρείται μετά. Σε accumulator το total ισούται με άθροισμα στοιχείων που επεξεργάστηκαν. Χρειάζεται πρόοδος για termination.

### Πρακτική περίπτωση
~~~python
def total(xs):
    s=0
    for x in xs:s+=x
    return s
assert total([2,3,4])==9
~~~

### Ανεξάρτητη άσκηση
Πρόσθεσε instrumentation και έλεγξε running sum ως prefix. Δοκίμασε empty input και αρνητικούς.

### Τεκμήρια για review
Για Iteration and invariants, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Αναδρομή και τερματισμός

### Αρχή σχεδιασμού
Κάθε recursive call πρέπει να μειώνει well-founded measure μέχρι base case. Αμετάβλητο argument προκαλεί απεριόριστη αναδρομή· αύξηση stack limit δεν διορθώνει λογική.

### Πρακτική περίπτωση
~~~python
def depth(n):
    if n<0: raise ValueError()
    if n==0:return 0
    return 1+depth(n-1)
assert depth(4)==4
~~~

### Ανεξάρτητη άσκηση
Σχεδίασε call stack για n=3. Σύγκρινε iterative υλοποίηση σε n=20000 και εξήγησε recursion depth limits.

### Τεκμήρια για review
Για Recursion and termination, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Όρια διαχείρισης σφαλμάτων

### Αρχή σχεδιασμού
Errors αντιμετωπίζονται εκεί όπου component μπορεί να αποφασίσει: parser αναφέρει invalid data, CLI επιλέγει μήνυμα/exit. Broad except Exception μπορεί να κρύψει bugs.

### Πρακτική περίπτωση
~~~python
def parse_port(s):
    n=int(s)
    if not 1<=n<=65535:raise ValueError('port')
    return n
assert parse_port('443')==443
~~~

### Ανεξάρτητη άσκηση
Ξεχώρισε conversion failure, out-of-range και missing file. Μετέτρεψε errors μόνο σε boundary που προσθέτει χρήσιμο context.

### Τεκμήρια για review
Για Error handling boundaries, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.
