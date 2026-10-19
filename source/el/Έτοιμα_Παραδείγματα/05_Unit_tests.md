# Συνταγή: έλεγχοι παλινδρόμησης με ιδιότητες αντί μόνο παραδείγματα

## Σενάριο και κριτήρια επιτυχίας
Περιόρισε έναν ακέραιο στο κλειστό διάστημα από 0 έως 10. Μερικοί απλοί έλεγχοι καλύπτουν την αναμενόμενη συμπεριφορά, αλλά μπορείς επιπλέον να αποδείξεις με δοκιμές ότι κάθε αποτέλεσμα μένει μέσα στο όριο και ότι μεγαλύτερη είσοδος δεν δίνει μικρότερη έξοδο. Οι ιδιότητες εξετάζονται σε συγκεκριμένο πεπερασμένο εύρος τεχνητών τιμών.

## Πλήρες εκτελέσιμο παράδειγμα
Αποθήκευσε ως `05_Unit_tests.py` και εκτέλεσε με Python 3 και την ενσωματωμένη βιβλιοθήκη. Δεν απαιτείται διαδίκτυο ή πρόσβαση σε πραγματικά αρχεία σου.

~~~python
import unittest
def clamp(value, bottom=0, top=10):
    if type(value) is not int or bottom > top:
        raise ValueError("invalid domain")
    return min(top,max(bottom,value))
class ClampTests(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(clamp(-2),0)
        self.assertEqual(clamp(5),5)
        self.assertEqual(clamp(11),10)
    def test_invariant(self):
        for n in range(-100,101):
            with self.subTest(n=n):
                self.assertTrue(0<=clamp(n)<=10)
    def test_monotonicity(self):
        for n in range(-20,20):
            self.assertLessEqual(clamp(n),clamp(n+1))
    def test_invalid(self):
        with self.assertRaises(ValueError):
            clamp(True)
suite=unittest.defaultTestLoader.loadTestsFromTestCase(ClampTests)
result=unittest.TextTestRunner(verbosity=0).run(suite)
assert result.wasSuccessful()
print("PASS bounded clamp regression suite")
~~~

## Τεχνική εξήγηση
Η test_invariant ελέγχει 201 εισόδους και η subTest δείχνει ποια ακριβώς απέτυχε. Η μονοτονία συγκρίνει διαδοχικές τιμές χωρίς να χρειάζεται ξεχωριστό αναμενόμενο αποτέλεσμα για κάθε μία. Ο έλεγχος `type(value) is int` αποκλείει τη λογική τιμή True, παρότι η bool κληρονομεί από int. Η επιτυχία 201 περιπτώσεων δεν αποτελεί μαθηματική απόδειξη για κάθε αυθαίρετα μεγάλο ακέραιο ή για άλλα όρια.

## Περιορισμένες ασκήσεις
Αντικατάστησε προσωρινά την έκφραση περιορισμού με λανθασμένη σειρά min και max και παρατήρησε ποιοι έλεγχοι αποτυγχάνουν. Πρόσθεσε διαφορετικά κάτω και άνω όρια και απόρριψη όταν το κάτω είναι μεγαλύτερο. Δοκίμασε δύο εκδόσεις Python και κατέγραψε πραγματικό περιβάλλον. Εισήγαγε σκόπιμο λάθος κατά μία μονάδα και κράτησε τη δοκιμή που το ανιχνεύει.

## Διάγνωση και ασφάλεια
Αν ένας έλεγχος αποτυγχάνει μόνο όταν τρέχει όλη η σουίτα, αναζήτησε κοινή μεταβλητή κατάσταση ή εξάρτηση από τη σειρά. Αν ο runner εμφανίζει επιτυχία χωρίς να εξετάζονται κρίσιμα όρια, εξακολουθεί να υπάρχει κενό κάλυψης. Διατήρησε τα αρνητικά παραδείγματα μαζί με τον κώδικα μετά την επιδιόρθωση.
