# Βασικές έννοιες: ακρίβεια αριθμών, είσοδοι και πολυπλοκότητα

## Ακρίβεια αριθμών και χρηματικά ποσά

### Το πρόβλημα και η ουσία
Οι binary floats δεν αναπαριστούν ακριβώς κάθε δεκαδικό. Επαναλαμβανόμενη στρογγυλοποίηση μπορεί να οδηγήσει σε λάθος σύνολα. Επέλεξε ακέραια cents ή Decimal με ρητό rounding rule και μη χρησιμοποιείς εμφανιζόμενα strings ως αριθμούς.

### Παράδειγμα
~~~python
from decimal import Decimal, ROUND_HALF_UP
price = Decimal('19.99')
vat = Decimal('0.24')
total = (price * (1 + vat)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
assert total == Decimal('24.79')
print(total)
~~~

### Ανεξάρτητος έλεγχος
Αναμενόμενο: 24.79. Δοκίμασε τρεις γραμμές τιμολογίου, σύγκρινε rounding ανά γραμμή και στο σύνολο. Έλεγξε αρνητική διόρθωση, ποσότητα μηδέν και νόμισμα με άλλη υποδιαίρεση. Εξήγησε γιατί η πολιτική είναι αναπαραγώγιμη.

**Επίσημη τεκμηρίωση:** https://docs.python.org/3/library/decimal.html

## Ανάλυση και έλεγχος εισόδου

### Αρχή σχεδιασμού
Parsing μετατρέπει κείμενο σε δομημένες τιμές· validation ελέγχει domain rules. Σωστό JSON μπορεί να περιέχει negative counts ή άγνωστα keys.

### Πρακτική περίπτωση
~~~python
import json
obj=json.loads('{"count":4}')
if set(obj)!={'count'} or type(obj['count']) is not int or obj['count']<0:raise ValueError()
assert obj['count']==4
~~~

### Ανεξάρτητη άσκηση
Άλλαξε JSON σε list, string count, boolean count και extra key. Ξεχώρισε JSONDecodeError από schema error.

### Τεκμήρια για review
Για Parsing and validation, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Πολυπλοκότητα χρόνου

### Μηχανισμός και όρια
Η χρονική πολυπλοκότητα περιγράφει πώς αυξάνονται οι πράξεις με το μέγεθος, όχι εγγυημένα milliseconds. Linear scan κάνει έως n ελέγχους· δύο πλήρεις nested loops n². Σε μικρά n οι constants και το setup επηρεάζουν.

### Παράδειγμα υλοποίησης
~~~python
def pair_count(n):
    return sum(1 for i in range(n) for j in range(n))
assert pair_count(10)==100
~~~

### Αναπαραγωγή και έλεγχος
Μέτρησε n=50,100,200 και πλήθος iterations, όχι μόνο wall time. Σύγκρινε factors με single-loop function και πρόσεξε measurement noise.

### Απαραίτητα τεκμήρια
Για Time complexity, κατέγραψε ποια είσοδος αλλάζει το αποτέλεσμα, ποια πράξη ευθύνεται και ένα test που θα αποκάλυπτε λάθος. Μέτρησε μνήμη ή χρόνο όταν επηρεάζουν τον ισχυρισμό και μην θεωρείς ένα demo απόδειξη για όλες τις εισόδους.

## Πολυπλοκότητα μνήμης

### Μηχανισμός και όρια
Η χωρική πολυπλοκότητα μετρά επιπλέον μνήμη σε σχέση με την είσοδο. Νέα λίστα μετασχηματισμού χρειάζεται O(n), ενώ generator μπορεί να κρατά O(1) state αν ο consumer καταναλώνει σταδιακά.

### Παράδειγμα υλοποίησης
~~~python
def squares(values):
    for n in values: yield n*n
assert list(squares(range(4)))==[0,1,4,9]
~~~

### Αναπαραγωγή και έλεγχος
Σύγκρινε list(squares(range(n))) με sum(squares(range(n))) και μέτρησε μνήμη. Generator δεν εξοικονομεί αν κάνεις άμεσα materialize.

### Απαραίτητα τεκμήρια
Για Space complexity, κατέγραψε ποια είσοδος αλλάζει το αποτέλεσμα, ποια πράξη ευθύνεται και ένα test που θα αποκάλυπτε λάθος. Μέτρησε μνήμη ή χρόνο όταν επηρεάζουν τον ισχυρισμό και μην θεωρείς ένα demo απόδειξη για όλες τις εισόδους.
