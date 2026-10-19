# Unit tests, fixtures και αναπαραγωγιμότητα

## Τι συμβαίνει
Ένα καλό test ορίζει προετοιμασία, ενέργεια και αναμενόμενη παρατήρηση. Χρησιμοποίησε μικρά ντετερμινιστικά δεδομένα αντί για τυχαιότητα ή live ιστοσελίδες.

## Πρακτικός έλεγχος
Για κώδικα με εξωτερικές υπηρεσίες κάνε mock στο HTTP όριο. Τα unit tests πρέπει να αποτυγχάνουν λόγω αλλαγής λογικής, όχι επειδή έπεσε το δίκτυο.

## Συνήθεις παγίδες
Έλεγξε διαδρομές σφαλμάτων τόσο καλά όσο την επιτυχία. Κράτησε regression test για κάθε σφάλμα που διορθώνεις στην παραγωγή.

## Μικρό παράδειγμα για προσαρμογή
```text
python -m unittest discover -v
```

## Κάνε την αρνητική περίπτωση παρατηρήσιμη
~~~python
from tempfile import TemporaryDirectory
from pathlib import Path
import json

with TemporaryDirectory() as folder:
    path = Path(folder) / 'settings.json'
    path.write_text('{broken', encoding='utf8')
    before = path.read_bytes()
    try:
        json.loads(path.read_text(encoding='utf8'))
    except json.JSONDecodeError:
        pass
    else:
        raise AssertionError('malformed JSON was accepted')
    assert path.read_bytes() == before
~~~
Το fixture ελέγχει απόρριψη και διατήρηση εισόδου. Ένα test που βλέπει μόνο exception μπορεί να αγνοήσει καταστροφή αρχείου πριν το error. Πρόσθεσε έγκυρο κενό configuration, Unicode value και λάθος top-level type. Έγκυρο JSON δεν σημαίνει αυτόματα σωστό configuration schema.

Κράτησε mutable fixtures τοπικά στο test και όχι σε κοινή module-level λίστα. Inject clocks και transport functions για expiry/network behavior. Έλεγξε απόκριση εφαρμογής και side effects, αντί για κάθε εσωτερική κλήση helper, ώστε ένα αβλαβές refactor να μην απαιτεί ολική αλλαγή tests.
