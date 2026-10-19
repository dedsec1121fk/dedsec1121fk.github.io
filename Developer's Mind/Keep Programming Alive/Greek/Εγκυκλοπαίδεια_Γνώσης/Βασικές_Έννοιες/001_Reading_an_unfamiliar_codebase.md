# Ανάγνωση κώδικα: τύποι, αναφορές και μεταβλητή κατάσταση

## Ανάγνωση άγνωστης βάσης κώδικα

### Κεντρική εξήγηση
Πριν αλλάξεις κώδικα βρες entry point, CLI arguments, configuration, imports, σχέση callers και την πραγματική έξοδο. Η ανάγνωση όλων των αρχείων αλφαβητικά δεν εξηγεί τη ροή δεδομένων όσο η παρακολούθηση μιας συγκεκριμένης εισόδου. Το όνομα συνάρτησης είναι υπόθεση, όχι απόδειξη.

### Εκτελέσιμο παράδειγμα
~~~python
def price_after_discount(cents: int, discount: int) -> int:
    if not 0 <= discount <= 100:
        raise ValueError("invalid discount")
    return cents * (100 - discount) // 100

def main():
    print(price_after_discount(1999, 10))

if __name__ == "__main__":
    main()
~~~

### Ερμηνεία του αποτελέσματος
Αποθήκευσε σε app.py και τρέξε `python app.py`: εμφανίζει 1799 ακέραια cents με στρογγυλοποίηση προς τα κάτω. Ακολούθησε main → price_after_discount → έλεγχο εισόδου → υπολογισμό → print. Το `import app` δεν τυπώνει αποτέλεσμα λόγω `__name__` guard. Κατέγραψε αυτές τις παρατηρήσεις πριν αναζητήσεις άλλα αρχεία.

### Πρακτική εξάσκηση
Φτιάξε πίνακα εισόδου, υπεύθυνης συνάρτησης, μετασχηματισμού και εξόδου. Πρόβλεψε και δοκίμασε discounts 0, 100 και -1. Παρατήρησε ότι δεν ελέγχονται αρνητικά `cents`: διαφορετικός κανόνας. Σε repo ξεχώρισε generated, vendored και maintained files πριν κάνεις αλλαγές. Κράτησε μικρό repro και τρέξε τα σχετικά tests.

**Τεκμηρίωση:** https://docs.python.org/3/library/__main__.html

## Τύποι και μετατροπές

### Κεντρική εξήγηση
Μία μετατροπή μπορεί να πετύχει συντακτικά αλλά να παραβιάζει business rule. Η Python `int(3.9)` κόβει αντί να στρογγυλοποιεί και η `bool` είναι subclass του `int`. Ένα string που μοιάζει αριθμός χρειάζεται σαφή γραμματική και όρια πριν χρησιμοποιηθεί σε υπολογισμό ή αποθήκευση.

### Εκτελέσιμο παράδειγμα
~~~python
def parse_quantity(value: object) -> int:
    if not isinstance(value, str):
        raise TypeError("expected text")
    if not value.isascii() or not value.isdecimal():
        raise ValueError("ASCII digits only")
    number = int(value)
    if number > 500:
        raise ValueError("range 0..500")
    return number

assert parse_quantity("004") == 4
for invalid in ("-1", "3.5", "٥", "501"):
    try:
        parse_quantity(invalid)
    except ValueError:
        pass
    else:
        raise AssertionError(invalid)
~~~

### Ερμηνεία του αποτελέσματος
Η γραμματική δέχεται αρχικά μηδενικά αλλά όχι πρόσημα, δεκαδικά, non-ASCII αριθμητικά σύμβολα ή τιμές πάνω από 500. Η `isdecimal()` μόνη της αναγνωρίζει ορισμένα Unicode ψηφία, γι' αυτό προστίθεται `isascii()`. Το κενό string απορρίπτεται.

### Πρακτική εξάσκηση
Άλλαξε τη συνάρτηση ώστε αρχικά μηδενικά να επιτρέπονται μόνο στο '0'. Δοκίμασε whitespace, True, None, 500, 501 και string με 100.000 ψηφία. Βάλε όριο μήκους πριν το int για περιορισμό πόρων. Μην μετατρέπεις κάθε exception σε 0: άκυρη τιμή, missing και έγκυρο μηδέν δεν είναι ίδια.

**Τεκμηρίωση:** https://docs.python.org/3/library/stdtypes.html#str.isdecimal

## Μεταβλητή κατάσταση και κοινές αναφορές

### Κεντρική εξήγηση
Δύο ονόματα μπορούν να παραπέμπουν στο ίδιο mutable object. Η αντιγραφή εξωτερικής λίστας δεν αντιγράφει κατ' ανάγκη nested dictionaries και lists. Μια mutation μέσω ενός reference μπορεί να εμφανίζεται και μέσω άλλου. Το rebind ονόματος διαφέρει από την αλλαγή κοινού αντικειμένου.

### Εκτελέσιμο παράδειγμα
~~~python
from copy import deepcopy
original = [{"name": "Ada", "scores": [8]}]
shallow = original.copy()
shallow[0]["scores"].append(9)
assert original[0]["scores"] == [8, 9]

isolated = deepcopy(original)
isolated[0]["scores"].append(10)
assert original[0]["scores"] == [8, 9]
assert isolated[0]["scores"] == [8, 9, 10]
~~~

### Ερμηνεία του αποτελέσματος
Το `copy()` αντιγράφει μόνο την εξωτερική λίστα· τα στοιχεία εξακολουθούν να δείχνουν στο ίδιο dict και scores list. Το `deepcopy` αντιγράφει αναδρομικά τις απλές δομές, επομένως η isolated μεταβολή δεν αγγίζει το original. Για sockets, locks και άλλα resources οι κανόνες αντιγραφής είναι διαφορετικοί.

### Πρακτική εξάσκηση
Σχεδίασε object graph με βέλη από original, shallow και isolated προς τις εσωτερικές δομές. Κάνε rebind το shallow[0] σε νέο dictionary και έλεγξε αν αλλάζει το original. Σχεδίασε συνάρτηση που δέχεται read-only input και επιστρέφει νέα τιμή χωρίς mutation. Σύγκρινε κόστος μνήμης και απομόνωση.

**Τεκμηρίωση:** https://docs.python.org/3/library/copy.html
