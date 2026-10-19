# Γλωσσάρι: branches, buffers και bytes

## Branch

### Πώς συμπεριφέρεται η έννοια
Επιλογή control flow ανά condition. Git branch είναι άλλη έννοια: movable reference προς commit history, όχι if statement.

### Μικρό παράδειγμα
~~~text
def label(score):
    if score>=50:return 'pass'
    return 'retry'
assert label(50)=='pass'
~~~

### Πρακτική διερεύνηση
Δοκίμασε 49/50 και κάλυψη και των δύο if branches. Τι χάνεται όταν δοκιμάζεις μόνο ένα path;

### Δοκιμή ορίου
Για Κλάδος εκτέλεσης, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Buffer

### Πώς συμπεριφέρεται η έννοια
Περιοχή μνήμης που κρατά δεδομένα ανάμεσα σε producer/consumer με διαφορετικές ταχύτητες. Buffers έχουν χωρητικότητα· unchecked writes προκαλούν memory corruption.

### Μικρό παράδειγμα
~~~text
from collections import deque
buffer=deque(maxlen=2)
buffer.append('a');buffer.append('b')
assert list(buffer)==['a','b']
~~~

### Πρακτική διερεύνηση
Πρόσθεσε τρίτο στοιχείο και δες eviction. Σύγκρινε overwrite-oldest με queue backpressure.

### Δοκιμή ορίου
Για Προσωρινός χώρος δεδομένων, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Byte

### Πώς συμπεριφέρεται η έννοια
Οκτώ bits στα σύγχρονα συστήματα· file lengths μετρούν bytes, ενώ strings μπορούν να μετρούν Unicode code points. UTF-8 χαρακτήρες χρειάζονται περισσότερα bytes.

### Μικρό παράδειγμα
~~~text
s='Γ'; encoded=s.encode('utf-8')
assert len(s)==1
assert len(encoded)==2
~~~

### Πρακτική διερεύνηση
Υπολόγισε UTF-8 bytes ASCII, ελληνικών και emoji και δες hex. Μην κόβεις encoded text σε τυχαίο byte offset.

### Δοκιμή ορίου
Για Byte, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Cache

### Πώς συμπεριφέρεται η έννοια
Αποθηκευμένα αποτελέσματα για reuse. Η ορθότητα εξαρτάται από keys, freshness και invalidation· γρήγορο stale result μπορεί να είναι λάθος.

### Μικρό παράδειγμα
~~~text
from functools import lru_cache
@lru_cache(maxsize=16)
def square(n):return n*n
assert square(3)==9
assert square(3)==9
~~~

### Πρακτική διερεύνηση
Δες cache_info().hits πριν/μετά repeated calls. Εξήγησε γιατί cache δεν μπορεί να εκπροσωπεί μεταβαλλόμενα user permissions.

### Δοκιμή ορίου
Για Κρυφή μνήμη, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Callback

### Πώς συμπεριφέρεται η έννοια
Function που δίνεται σε άλλο component για μεταγενέστερη κλήση, όπως button handler. Context, σειρά και lifetime είναι μέρος του contract.

### Μικρό παράδειγμα
~~~text
def apply(value, callback):return callback(value)
assert apply(4,lambda n:n*2)==8
~~~

### Πρακτική διερεύνηση
Δώσε δύο callbacks με διαφορετικό output και δοκίμασε callback που πετά exception.

### Δοκιμή ορίου
Για Συνάρτηση επανάκλησης, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.
