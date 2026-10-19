# Μονάδες ελέγχου και παλινδρομήσεις

Το τεστ ελέγχει αναμενόμενη συμπεριφορά και οριακές περιπτώσεις. Στο DedSec οι στατικοί έλεγχοι αποφεύγουν την εκτέλεση εργαλείων με παρενέργειες. Χρησιμοποίησε προσωρινούς φακέλους και προσομοίωση δικτύου.

## Λυμένο παράδειγμα

```text
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
```

## Άσκηση

Πρόσθεσε έλεγχο για add(0, 0).

## Λύση / υπόδειξη

assert add(0, 0) == 0.

## Tests που αποτυγχάνουν για τον σωστό λόγο
Κάθε test χρειάζεται είσοδο, αναμενόμενη έξοδο και σαφή αιτία αποτυχίας. Έλεγξε κανονική περίπτωση, δύο όρια, κενή και άκυρη είσοδο χωριστά. Το `unittest` περιλαμβάνεται στην Python:
```python
import unittest
def clamp(v,lo,hi):
    if lo>hi: raise ValueError("bounds reversed")
    return min(hi,max(lo,v))
class ClampTests(unittest.TestCase):
    def test_inside(self): self.assertEqual(clamp(5,0,10),5)
    def test_lower(self): self.assertEqual(clamp(-1,0,10),0)
    def test_invalid(self):
        with self.assertRaises(ValueError): clamp(0,4,2)
if __name__=="__main__": unittest.main()
```
Regression test: αποτυγχάνει στον παλιό σπασμένο κώδικα και περνά στη διόρθωση. Μόκαρε δικτυακό client στο δικό σου όριο εφαρμογής αντί να βασίζεσαι σε live υπηρεσία.

**Άσκηση:** άλλαξε σκόπιμα `max(lo,v)` σε `min(lo,v)` και δες ποιο test εντοπίζει το σφάλμα· πρόσθεσε test αν χρειάζεται.

## Mutation lab: το test πρέπει να βρίσκει χαλασμένο κανόνα

~~~python
import unittest
def clean(s):
    if not isinstance(s, str):
        raise TypeError("text required")
    return s.strip().casefold()
class Checks(unittest.TestCase):
    def test_name(self):
        self.assertEqual(clean(" Ada "), "ada")
    def test_blank(self):
        self.assertEqual(clean("  "), "")
    def test_type(self):
        with self.assertRaises(TypeError):
            clean(None)
if __name__ == "__main__":
    unittest.main()
~~~

Εκτέλεσε το `test_clean.py` σε προσωρινό φάκελο. Μετά αφαίρεσε σκόπιμα τη `strip()`: το test `" Ada "` πρέπει να αποτύχει. Επανέφερε τη λειτουργία και επαλήθευσε επιτυχή εκτέλεση. Αν η σουίτα παραμένει πράσινη παρότι κατέστρεψες τον κανόνα, τα assertions είναι ανεπαρκή. Πρόσθεσε ελληνικό όνομα και παράδειγμα για παλαιό bug. Μην εξαρτάς unit tests από εξωτερικές υπηρεσίες και μεταβαλλόμενη ώρα. Πηγή: https://docs.python.org/3/library/unittest.html
