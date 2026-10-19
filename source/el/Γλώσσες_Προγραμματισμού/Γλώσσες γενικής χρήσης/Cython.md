# cython — συγκεντρωτικός οδηγός

## Cython

Η Cython μεταγλωττίζει κώδικα τύπου Python σε extension. Κάνε profiling πρώτα: η μεταγλώττιση δεν εγγυάται επιτάχυνση. Χρειάζονται C compiler, Cython και setuptools.

### Δύο αρχεία

Αποθήκευσε fastmath.pyx:

~~~cython
# cython: boundscheck=True, wraparound=False
cpdef long sum_squares(long[:] values):
    cdef Py_ssize_t i
    cdef long total = 0
    for i in range(values.shape[0]):
        total += values[i] * values[i]
    return total
~~~

Δημιούργησε setup.py:

~~~python
from setuptools import setup
from Cython.Build import cythonize
setup(ext_modules=cythonize("fastmath.pyx", language_level=3))
~~~

Σε προσωρινό φάκελο εκτέλεσε:

~~~sh
python setup.py build_ext --inplace
python -c "from array import array; from fastmath import sum_squares; assert sum_squares(array('l',[2,3,5])) == 38"
~~~

Το παράδειγμα μεταγλωττίστηκε και ελέγχθηκε τοπικά.

### Εξήγηση

Η cpdef δέχεται κλήσεις από Python. Το long[:] απαιτεί συμβατό buffer, όπως array('l'), όχι list. Ο C long έχει πεπερασμένο εύρος και μπορεί να υπερχειλίσει.

### Ασκήσεις

Δοκίμασε κενό array: αποτέλεσμα μηδέν. Δώσε list και εξέτασε το σφάλμα μετατροπής. Σύγκρινε με Python αφού επιβεβαιώσεις ίσα αποτελέσματα, συμπεριλαμβάνοντας το κόστος δημιουργίας buffer.

Τεκμηρίωση: https://cython.readthedocs.io/en/latest/src/userguide/memoryviews.html

## Εργαστήριο εξάσκησης: Cython

### Μεταγλώττισε το πραγματικό αρχικό αρχείο
Το `00_starter.pyx` ορίζει `def square(int x): return x * x`. Αντέγραψέ το σε ξεχωριστό δοκιμαστικό φάκελο ως `cy_lab.pyx`, ώστε το όνομα της μονάδας να μπορεί να εισαχθεί κανονικά από Python. Χρειάζονται Python, Cython και μεταγλωττιστής C. Στον προσωρινό φάκελο δοκίμασε:

~~~sh
cythonize -i cy_lab.pyx
python -c "import cy_lab; assert cy_lab.square(-3) == 9; assert cy_lab.square(0) == 0; print(cy_lab.square(12))"
~~~

Η αναμενόμενη εκτύπωση είναι `144`. Οι εντολές είναι **προτεινόμενες δοκιμές, όχι επιβεβαιωμένη εκτέλεση**. Κατέγραψε την έκδοση Python και Cython, τον μεταγλωττιστή και την πραγματική έξοδο. Μην εγκαθιστάς άγνωστα πακέτα από μη έμπιστους φακέλους.

### Εντόπισε το όριο των τύπων
Η παράμετρος `int x` μετατρέπει δεδομένα του καλούντος Python σε αριθμό τύπου C. Δοκίμασε χωριστά `12`, `-3`, `0`, `3.5` και έναν πολύ μεγάλο ακέραιο. Διαχώρισε το σφάλμα μετατροπής από τον υπολογισμό. Το `int` της C έχει περιορισμένο εύρος ανά πλατφόρμα· επιτυχία σε μικρές τιμές δεν αποδεικνύει ασφαλή συμπεριφορά σε υπερχείλιση.

### Σύγκριση με έλεγχο αναφοράς
Φτιάξε σε απλό αρχείο Python τη `def py_square(x): return x*x`. Επιβεβαίωσε ότι `py_square(46341) == 2147488281`. Μη θεωρήσεις ότι η μεταγλωττισμένη συνάρτηση έχει την ίδια συμπεριφορά για τιμές έξω από το εύρος του τύπου C. Άλλαξε σκόπιμα τον τύπο της παραμέτρου, ξανακάνε μεταγλώττιση και χρησιμοποίησε ακριβώς τα ίδια δεδομένα εισόδου. Έτσι συγκρίνεις δύο υλοποιήσεις χωρίς να μπερδεύεις την ταχύτητα με την ορθότητα.

### Αστοχία και ανεξάρτητη άσκηση
Σε αποτυχία μεταγλώττισης έλεγξε χωριστά αν λείπει το Cython, αν απουσιάζει μεταγλωττιστής C ή αν υπάρχει συντακτικό λάθος στο `.pyx`. Κράτησε την πρώτη πλήρη διάγνωση και την εντολή αναπαραγωγής. Πρόσθεσε δική σου συνάρτηση για άθροισμα τετραγώνων μιας μικρής λίστας: έλεγξε κενή λίστα, μηδέν, αρνητικούς και ακατάλληλους τύπους. Εξήγησε σε ποιο σημείο εμφανίζεται κάθε σφάλμα. Τεκμηρίωση: https://cython.readthedocs.io/

## Cython — Διαδρομή ουσιαστικής εξάσκησης

### Στάδιο 1: κατανόηση εκτέλεσης
Γράψε .pyx function που αθροίζει memoryview doubles με typed loop index και accumulator. Κάνε build με μικρό setup/pyproject και σύγκρινε με Python sum().

### Στάδιο 2: απόδειξη με ελεγχόμενες δοκιμές
Έλεγξε type και contiguity του memoryview. Μέτρησε χρόνο σε πολλά μεγέθη και μην συμπεριλάβεις compilation/import. Τα typed loops βοηθούν, αλλά Python object operations μπορεί να κυριαρχούν.

### Στάδιο 3: μικρό ολοκληρωμένο έργο
Δοκίμασε out-of-bounds μόνο με ενεργό bounds checking και κράτησε diagnostic. Η απενεργοποίηση boundscheck για ταχύτητα απαιτεί αποδεδειγμένα invariants.

### Επαναλήψιμο εργαστήριο Cython με typed memoryview
~~~cython
# fastsum.pyx
def total(int[:] values):
    cdef Py_ssize_t i
    cdef long accumulator = 0
    for i in range(values.shape[0]):
        accumulator += values[i]
    return accumulator
~~~
Φτιάξε Python array.array('i', [1, -2, 5]) και βεβαιώσου ότι η total επιστρέφει τέσσερα. Σύγκρινε με τη Python sum() στην ίδια ακριβώς είσοδο, με πολλές μετρήσεις αφού προθερμάνεις τις δύο υλοποιήσεις. Μια απλή Python list δεν ικανοποιεί το συμβόλαιο buffer του typed memoryview. Κατέγραψε εκδόσεις Python, Cython και C compiler. Έλεγξε κενό array και περιέγραψε overflow όταν το άθροισμα υπερβεί το εύρος του C long. Η ταχύτητα δεν δικαιολογεί λανθασμένο αποτέλεσμα.
