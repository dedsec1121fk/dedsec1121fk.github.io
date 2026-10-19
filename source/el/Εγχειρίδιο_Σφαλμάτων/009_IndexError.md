# IndexError: έλεγξε τα όρια χωρίς να κρύβεις σφάλματα

## Τι συμβαίνει και πότε
Το IndexError δείχνει προσπέλαση εκτός ορίων ακολουθίας. Οι μη αρνητικές θέσεις είναι από 0 έως len(items)-1· οι αρνητικές μετρούν από το τέλος, αλλά αποτυγχάνουν σε κενή λίστα. Συχνές αιτίες είναι λάθος όριο βρόχου, λανθασμένη υπόθεση για split() ή δείκτης που έμεινε μετά από διαγραφή.

## Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 009_IndexError.py και εκτέλεσε `python3 009_IndexError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
def first_and_last(values):
    if not values:
        return None
    return values[0], values[-1]
assert first_and_last([]) is None
assert first_and_last([8]) == (8, 8)
assert first_and_last([8, 9]) == (8, 9)
try:
    [][0]
except IndexError:
    pass
else:
    raise AssertionError("empty list indexed")
~~~

## Διαγνωστική διαδικασία και ασφαλής διόρθωση
Έλεγξε len(sequence) και τον δείκτη στο σημείο αποτυχίας. Ακολούθησε ποιος δημιούργησε ή μείωσε τη λίστα. Προτίμησε for value in values αν δεν χρειάζεσαι θέσεις και enumerate(values) αν χρειάζεσαι. Πιάσε IndexError μόνο αν η απουσία στοιχείου είναι αναμενόμενη περίπτωση.

## Πρακτικό εργαστήριο / έλεγχος ορίων
Γράψε nth(values, index) με τεκμηριωμένη υποστήριξη αρνητικών δεικτών. Αποφάσισε αν εκτός ορίων επιστρέφει None ή κάνει raise· δοκίμασε κενή λίστα, ένα στοιχείο, len(values) και -len(values)-1.

## Ασφαλής πρόσβαση σε θέση χωρίς σύγχυση με None
Η επιστροφή None για ανύπαρκτο στοιχείο είναι αμφίσημη όταν η λίστα μπορεί να περιέχει πραγματικό None. Χρησιμοποίησε ξεχωριστό αντικείμενο-δείκτη που δίνει ο καλών και όρισε ρητά αν επιτρέπονται αρνητικοί δείκτες. Απέρριψε τις Boolean τιμές: στην Python το True λειτουργεί και ως ακέραιος 1.

~~~python
def nth_or(values, index, default):
    if type(index) is not int:
        raise TypeError('index must be int, not bool')
    if -len(values) <= index < len(values):
        return values[index]
    return default

missing = object()
assert nth_or([None, 'b'], 0, missing) is None
assert nth_or([None, 'b'], -1, missing) == 'b'
assert nth_or([], 0, missing) is missing
assert nth_or([3], -2, missing) is missing
try: nth_or([1], True, missing)
except TypeError: pass
else: raise AssertionError('bool index accepted')
~~~

## Εντοπισμός του πραγματικού ορίου
Για μήκος n, ο μικρότερος έγκυρος αρνητικός δείκτης είναι -n· ο -n-1 αποτυγχάνει. Πριν αλλάξεις τον έλεγχο, βρες αν ένα φίλτρο αφαίρεσε στοιχεία, αν η split() επέστρεψε λιγότερα πεδία ή αν άλλαξε η συλλογή μετά τον υπολογισμό της θέσης. Ως τελική άσκηση εξήγησε τις πέντε δοκιμές και πρόσθεσε μία πλειάδα και έναν θετικό δείκτη εκτός ορίων.
