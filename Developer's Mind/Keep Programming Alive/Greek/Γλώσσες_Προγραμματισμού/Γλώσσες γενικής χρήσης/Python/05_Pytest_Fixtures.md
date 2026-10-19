# Python tests: μικρές, ανεξάρτητες και αποδείξιμες συμπεριφορές

## Γράψε πρώτα τον κανόνα
Θέλουμε συνάρτηση που αποδέχεται πραγματικό μη αρνητικό ακέραιο ποσότητας. Η μετατροπή οποιουδήποτε string δεν ταυτίζεται με τον έλεγχο επιχειρησιακής τιμής. Η αποτυχία πρέπει να δίνει σαφή εξαίρεση και όχι «βολικό» αποτέλεσμα που κρύβει λανθασμένα δεδομένα. Τα tests πρέπει να ελέγχουν το δημόσιο συμβόλαιο και όχι το όνομα μιας τοπικής μεταβλητής.

~~~python
import pytest

def quantity(value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError('integer required')
    if value < 0:
        raise ValueError('negative quantity')
    return value

@pytest.mark.parametrize('value', [0, 1, 999])
def test_accepts_int(value):
    assert quantity(value) == value

def test_rejects_bool():
    with pytest.raises(TypeError):
        quantity(True)

def test_rejects_negative():
    with pytest.raises(ValueError):
        quantity(-1)
~~~

## Η παγίδα του bool
Στην Python το bool είναι υποκλάση του int, οπότε το απλό `isinstance(True, int)` επιστρέφει αληθές. Αν το σύστημα αποθεμάτων απαιτεί ποσότητα και όχι flag, πρέπει να το απορρίπτουμε ρητά. Τα boundary tests δείχνουν στους μελλοντικούς maintainers ποια συμπεριφορά είναι σκόπιμη και γιατί.

## Διαχώρισε τα επίπεδα δοκιμών
Το παραπάνω unit test δεν χρειάζεται δίκτυο ή πραγματικό filesystem. Έλεγχοι υπηρεσιών, αρχείων ή native ABI ανήκουν σε integration tests με ελεγχόμενες εισόδους. Για προσωρινά αρχεία στο pytest μπορείς να χρησιμοποιήσεις το `tmp_path`, ώστε να μην τροποποιείται ο πραγματικός workspace. Η έκδοση Python/pytest πρέπει να καταγράφεται.

## Τεκμήριο ολοκλήρωσης
Για νέο bug γράψε test που αρχικά αποτυγχάνει και μετά διορθώνεις τη συνάρτηση. Κατάγραψε το πραγματικό red → green, την έξοδο των tests και την έκδοση εργαλείων. Δεν ισχυριζόμαστε ότι ο κώδικας εκτελέστηκε στη συσκευή του αναγνώστη.
