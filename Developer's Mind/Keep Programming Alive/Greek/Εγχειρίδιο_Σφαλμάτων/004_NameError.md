# Python: ονόματα, τύποι και απόντα κλειδιά

## NameError

### Τι συμβαίνει και πότε
Το NameError δηλώνει ότι το όνομα που ζητήθηκε δεν ορίζεται στο τρέχον πεδίο. Προκύπτει από τυπογραφικό λάθος, από ανάθεση που δεν εκτελέστηκε, από λανθασμένη σειρά αρχικοποίησης ή από εισαγωγή διαφορετικού module. Αν υπάρχει τοπική ανάθεση μέσα σε συνάρτηση, η πρώιμη χρήση μπορεί να δώσει UnboundLocalError.

### Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 004_NameError.py και εκτέλεσε `python3 004_NameError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
def discount(price, eligible):
    amount = price
    if eligible:
        amount = price * 0.9
    return amount
assert discount(100, True) == 90
assert discount(100, False) == 100
try:
    eval("ammount", {})
except NameError as exc:
    assert "ammount" in str(exc)
else:
    raise AssertionError("misspelling was not caught")
~~~

### Διαγνωστική διαδικασία και ασφαλής διόρθωση
Ξεκίνα από την ακριβή ορθογραφία του traceback και το scope της συνάρτησης. Ακολούθησε τους κλάδους συνθηκών με την είσοδο που απέτυχε. Μη διορθώνεις το πρόβλημα προσθέτοντας αυθαίρετες τιμές στο globals(). Σε notebook επανεκκίνησε το kernel και εκτέλεσε όλα τα cells με τη σωστή σειρά.

### Πρακτικό εργαστήριο / έλεγχος ορίων
Βάλε την αρχικοποίηση του amount μόνο μέσα στο if eligible. Βρες την αποτυχία όταν eligible=False, μετέφερε την αρχικοποίηση έξω και γράψε δύο τεστ. Έπειτα σύγκρινε NameError με UnboundLocalError σε συνάρτηση που διαβάζει x πριν από x = 1.

## TypeError

### Τι συμβαίνει και πότε
Το TypeError εμφανίζεται όταν μια πράξη ή κλήση δέχεται μη συμβατούς τύπους: πρόσθεση str και int, κλήση μη callable τιμής, άγνωστο keyword ή ελλιπείς παραμέτρους. Πριν μετατρέψεις τύπους, βρες αν φταίει ο καλών κώδικας ή το συμβόλαιο API. Οι σιωπηρές μετατροπές μπορεί να κρύβουν προβλήματα εισόδου.

### Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 006_TypeError.py και εκτέλεσε `python3 006_TypeError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
def total_cost(price, quantity):
    if not isinstance(price, (int, float)):
        raise TypeError("price must be numeric")
    if type(quantity) is not int:
        raise TypeError("quantity must be an integer")
    return price * quantity
assert total_cost(2.5, 3) == 7.5
try:
    total_cost("2.5", 3)
except TypeError as exc:
    assert "numeric" in str(exc)
else:
    raise AssertionError("invalid type accepted")
~~~

### Διαγνωστική διαδικασία και ασφαλής διόρθωση
Έλεγξε type(value), repr(value), την υπογραφή της συνάρτησης και το πρώτο σχετικό frame του traceback. Οι τιμές από input() ή JSON δεν έχουν πάντα τον αναμενόμενο τύπο. Κάνε έλεγχο στα όρια της εφαρμογής και ρητή μετατροπή μόνο όταν επιτρέπεται. Το bool είναι υποκλάση του int· χρησιμοποίησε type(x) is int όταν το True δεν πρέπει να σημαίνει μία μονάδα.

### Πρακτικό εργαστήριο / έλεγχος ορίων
Επέκτεινε το συμβόλαιο ώστε να απορρίπτει αρνητική ποσότητα και μη πεπερασμένη τιμή. Ποιο σφάλμα είναι σωστό: TypeError ή ValueError; Τεκμηρίωσε τη διάκριση και γράψε assert για True ως ποσότητα και NaN ως τιμή.

## KeyError

### Τι συμβαίνει και πότε
Το dict[key] προκαλεί KeyError όταν λείπει το κλειδί. Ο χειρισμός εξαρτάται από το σχήμα: ένα προαιρετικό εμφανιζόμενο όνομα μπορεί να έχει προεπιλογή, αλλά η απουσία αναγνωριστικού συναλλαγής είναι παραβίαση συμβολαίου. Η καθολική χρήση get() μπορεί να μετατρέπει χαλασμένα δεδομένα σε φαινομενικά έγκυρα.

### Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 008_KeyError.py και εκτέλεσε `python3 008_KeyError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
def label(record):
    order_id = record["id"]  # required
    nickname = record.get("nickname")
    return f"{order_id}: {nickname or 'Guest'}"
assert label({"id": 7}) == "7: Guest"
assert label({"id": 7, "nickname": "Ada"}) == "7: Ada"
try:
    label({"nickname": "Ada"})
except KeyError as exc:
    assert exc.args == ("id",)
else:
    raise AssertionError("required key was optional")
~~~

### Διαγνωστική διαδικασία και ασφαλής διόρθωση
Για μη ευαίσθητα δοκιμαστικά δεδομένα κατέγραψε sorted(record.keys()), όχι ολόκληρα πραγματικά payloads. Σύγκρινε το schema με το αποτέλεσμα του parser. Όταν το None είναι έγκυρη αποθηκευμένη τιμή, το get() δεν ξεχωρίζει απουσία από ρητή τιμή None χωρίς sentinel.

### Πρακτικό εργαστήριο / έλεγχος ορίων
Δημιούργησε sentinel = object() και ξεχώρισε αν λείπει το nickname, αν είναι None ή αν είναι ''. Όρισε συμπεριφορά εμφάνισης για κάθε περίπτωση, διατηρώντας υποχρεωτικό το id, και έλεγξε και τα τρία όρια.
