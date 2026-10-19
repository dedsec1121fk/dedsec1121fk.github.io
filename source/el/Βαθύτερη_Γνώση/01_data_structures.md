# Δομές δεδομένων — περιορισμένη μνήμη λιγότερο πρόσφατης χρήσης

## Συγκεκριμένο πρόβλημα
Μία βιβλιοθήκη γνώσης που λειτουργεί χωρίς διαδίκτυο θέλει να κρατά τα δύο τελευταία μαθήματα στη μνήμη. Η αναζήτηση κλειδιού μέσα σε λίστα απαιτεί O(n) ελέγχους, ενώ ο πίνακας κατακερματισμού προσφέρει συνήθως O(1), αλλά δεν ενημερώνει αυτόματα τη σειρά χρήσης. Η OrderedDict υποστηρίζει αναζήτηση κλειδιού και ρητή μετακίνησή του στην πιο πρόσφατη θέση. Όρισε θετική ακέραιη χωρητικότητα και αφαίρεσε τη λιγότερο πρόσφατα χρησιμοποιημένη εγγραφή όταν ξεπεραστεί το όριο.

## Εκτελέσιμο πρόγραμμα Python 3
Αποθήκευσε ως cache_lab.py και εκτέλεσε python3 cache_lab.py. Το πρόγραμμα δεν χρησιμοποιεί αρχεία και ελέγχει την εκτόπιση, τα ελλείποντα κλειδιά και τη μη επιτρεπτή χωρητικότητα.

~~~python
from collections import OrderedDict
MISSING = object()
class Cache:
    def __init__(self, capacity):
        if type(capacity) is not int or capacity < 1:
            raise ValueError('positive integer capacity required')
        self.capacity = capacity
        self.items = OrderedDict()
    def get(self, key):
        if key not in self.items:
            return MISSING
        self.items.move_to_end(key)
        return self.items[key]
    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            return self.items.popitem(last=False)
        return None
c = Cache(2)
assert c.get('a') is MISSING
assert c.put('a', None) is None
assert c.get('a') is None
c.put('b', 2)
assert c.get('a') is None
assert c.put('c', 3) == ('b', 2)
assert list(c.items) == ['a', 'c']
try:
    Cache(0)
except ValueError:
    pass
else:
    raise AssertionError('zero capacity was accepted')
print('PASS cache: eviction, missing sentinel, recency')
~~~

## Μνήμη και σημασιολογία
Οι λειτουργίες get και put έχουν αναμενόμενο κόστος O(1), ενώ η μνήμη είναι O(χωρητικότητα). Η απλή dict που διατηρεί σειρά εισαγωγής δεν αποτελεί από μόνη της μηχανισμό πρόσφατης χρήσης: η ανάγνωση δεν αλλάζει τη θέση του κλειδιού. Το μοναδικό αντικείμενο MISSING επιτρέπει να ξεχωρίζουμε ένα απόν κλειδί από ένα υπάρχον κλειδί με τιμή None. Η υλοποίηση δεν συγχρονίζει πολλαπλά νήματα που αλλάζουν ταυτόχρονα το cache.

## Περιορισμένες ασκήσεις
1. Βάλε χωρητικότητα ένα, πρόσθεσε τρία κλειδιά και έλεγξε την εκτόπιση. Ενημέρωσε υπάρχον κλειδί και παρατήρησε τη σειρά.
2. Σύγκρινε την ισότητα δύο λιστών με την ταυτότητα των αντικειμένων τους. Εξήγησε γιατί τα κλειδιά πρέπει να είναι κατακερματίσιμα.
3. Δοκίμασε λίστα ζευγών αντί OrderedDict με 10.000 κλειδιά και αιτιολόγησε την επιβάρυνση αναζήτησης.
4. Έλεγξε Cache(0), Cache(True) και μη ακέραια χωρητικότητα. Η bool κληρονομεί από int, αλλά ο έλεγχος ακριβούς τύπου την απορρίπτει.

**Παραδοτέα:** PASS, σειρά εκτόπισης, διάκριση απουσίας από None και ρεαλιστικό όριο μνήμης για κινητή συσκευή.
