# Παρενέργεια — διαχώρισε τον υπολογισμό από την εξωτερική αλλαγή

## Τι είναι
Παρενέργεια είναι μία αλλαγή που παρατηρείται πέρα από την επιστρεφόμενη τιμή μιας συνάρτησης: αποθήκευση αρχείου, αίτημα δικτύου, εγγραφή καταγραφής, αλλαγή κοινόχρηστου αντικειμένου ή εξάρτηση από την τρέχουσα ώρα. Οι καθαροί υπολογισμοί έχουν αναπαραγώγιμο αποτέλεσμα που εξαρτάται μόνο από τις παραμέτρους τους. Χώρισε υπολογισμό και εξωτερική ενέργεια για να ελέγχεις τη συμπεριφορά με δοκιμαστικό writer, χωρίς πραγματικά αρχεία χρήστη.

## Εκτελέσιμο πρόγραμμα Python 3
Αποθήκευσε ως side_lab.py και εκτέλεσε python3 side_lab.py. Η compute υπολογίζει ακέραια λεπτά, η render δημιουργεί ταξινομημένο JSON, και η publish καλεί τον writer μόνο μετά από πλήρη επικύρωση. Δοκιμάζονται εσκεμμένα μία άκυρη εγγραφή και μία αποτυχία αποθήκευσης.

~~~python
import json

def compute(entries):
    totals = {}
    for category, cents in entries:
        if not isinstance(category, str) or not category or type(cents) is not int or cents < 0:
            raise ValueError('invalid entry')
        totals[category] = totals.get(category, 0) + cents
    return totals

def render(entries):
    return json.dumps(compute(entries), ensure_ascii=False, sort_keys=True) + '\n'

def publish(entries, writer):
    payload = render(entries)  # Validate before invoking any side-effectful function.
    writer(payload)

out = []
publish([('βιβλία', 120), ('books', 30)], out.append)
assert out == ['{"books": 30, "βιβλία": 120}\n']
try:
    publish([('valid', 10), ('invalid', -1)], out.append)
except ValueError:
    pass
else:
    raise AssertionError('invalid input published')
assert len(out) == 1
try:
    publish([('books', 1)], lambda x: (_ for _ in ()).throw(OSError('disk unavailable')))
except OSError:
    pass
else:
    raise AssertionError('write failure hidden')
assert render([('βιβλία', 120), ('books', 30)]) == out[0]
print('PASS side effects: pure core, injected writer, errors')
~~~

## Όρια των εγγυήσεων
Η πρώτη κλήση προσθέτει μία συμβολοσειρά στη δοκιμαστική λίστα, διατηρώντας την ελληνική κατηγορία. Η άκυρη είσοδος απορρίπτεται πριν εκτελεστεί ο writer, οπότε η λίστα δεν αλλάζει. Ένας πραγματικός writer μπορεί παρ' όλα αυτά να αποτύχει αφού έχει γράψει μερικά byte. Αυτό το παράδειγμα δεν κάνει αυτόματα τη διαχείριση αρχείων ατομική. Σε πραγματική αναφορά χρησιμοποίησε προσωρινό αρχείο, έλεγξε ότι αποθηκεύτηκε και μετά αντικατάστησε τον προορισμό όπου υποστηρίζεται η ατομική μετονομασία. Ο υπολογισμός δεν μεταβάλλει την αρχική είσοδο και χρησιμοποιεί ακέραια ποσά.

## Ασκήσεις με ελέγχους
1. Πρόσθεσε κοινόχρηστο global counter στην compute και τρέξε δύο φορές. Δείξε πώς η ίδια είσοδος αποκτά διαφορετική εξωτερική συμπεριφορά.
2. Πρόσθεσε writer που αποθηκεύει μόνο τρία byte και μετά αποτυγχάνει. Εξήγησε ποιο επίπεδο πρέπει να εγγυηθεί ατομική αντικατάσταση.
3. Χρησιμοποίησε κατηγορία με ελληνικά ή κόμμα και βεβαιώσου ότι το JSON είναι έγκυρο και αναπαραγώγιμο.
4. Δοκίμασε αρνητικό ποσό και boolean αντί ακέραιου. Ο writer δεν πρέπει να λάβει κανένα νέο αποτέλεσμα.

**Παραδοτέα:** PASS, σταθερή αναφορά JSON, απόρριψη χωρίς αλλαγή εξωτερικής κατάστασης και σαφής περιορισμός για μερική αποτυχία εγγραφής.
