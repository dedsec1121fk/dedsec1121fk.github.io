# UnicodeDecodeError: αποκωδικοποίηση byte με σαφή πολιτική

## Τι συμβαίνει και πότε
Το UnicodeDecodeError σημαίνει ότι τα ακατέργαστα bytes δεν αποτελούν έγκυρο κείμενο με την επιλεγμένη κωδικοποίηση. Η επέκταση αρχείου και οι υποθέσεις locale δεν αποτελούν συμβόλαιο. Μη χρησιμοποιείς errors='ignore' μόνο για να εξαφανιστεί το σφάλμα: μπορεί να αλλοιώσει σιωπηρά αναγνωριστικά, CSV πεδία και σημαντικά δεδομένα.

## Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 015_UnicodeDecodeError.py και εκτέλεσε `python3 015_UnicodeDecodeError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as tmp:
    path = Path(tmp) / "sample.txt"
    path.write_bytes("café".encode("cp1252"))
    try:
        path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        print("bad byte offset:", exc.start)
    else:
        raise AssertionError("wrong encoding accepted")
    assert path.read_text(encoding="cp1252") == "café"
~~~

## Διαγνωστική διαδικασία και ασφαλής διόρθωση
Εξέτασε μικρό δείγμα bytes σε hex, την προδιαγραφή του δημιουργού και τυχόν BOM. Αποκωδικοποίησε με την πραγματική κωδικοποίηση. Αν τα αρχεία ποικίλλουν, χρησιμοποίησε αξιόπιστα metadata ή απόρριψε τα αμφίσημα. Το errors='replace' ταιριάζει μόνο σε προβολή με σαφή προειδοποίηση απώλειας δεδομένων.

## Πρακτικό εργαστήριο / έλεγχος ορίων
Κωδικοποίησε την ίδια λέξη σε UTF-8 και cp1252, σύγκρινε τα hex bytes και αποκωδικοποίησε σωστά και τις δύο. Πρόσθεσε δείγμα με κομμένη πολυ-byte ακολουθία UTF-8 και έλεγξε ότι ο strict decoder αποτυγχάνει στην αναμενόμενη θέση.

## Ακριβής ανάκτηση bytes ή ρητά μη αναστρέψιμη προβολή
Αν δεν γνωρίζεις την κωδικοποίηση του δημιουργού, μην επιλέγεις αυθαίρετα Latin-1 μόνο επειδή δεν εμφανίζει σφάλμα. Η επιλογή surrogateescape επιτρέπει ελεγχόμενη επανακωδικοποίηση των μη αναγνώσιμων bytes χωρίς απώλεια. Το ενδιάμεσο κείμενο όμως δεν είναι κατάλληλο για ανεξέλεγκτη εμφάνιση ή ανταλλαγή.

~~~python
raw = b'\xffA'
try: raw.decode('utf-8')
except UnicodeDecodeError as exc:
    assert exc.start == 0 and exc.end == 1
else: raise AssertionError('expected invalid UTF-8')
recovered = raw.decode('utf-8', errors='surrogateescape')
assert recovered.encode('utf-8', errors='surrogateescape') == raw
assert '\ufffd' in raw.decode('utf-8', errors='replace')
~~~

## Διάγνωση και τελική δοκιμή
Διατήρησε τα αρχικά bytes, σημείωσε τη θέση αποτυχίας και αναζήτησε την τεκμηριωμένη κωδικοποίηση του δημιουργού. Αν επιβεβαιωθεί, χρησιμοποίησέ την· διαφορετικά απομόνωσε το αρχείο ή εμφάνισε σαφώς επισημασμένη προβολή με απώλειες. Σύγκρινε τα bytes της λέξης café σε UTF-8 και cp1252 και πρόσθεσε μια κομμένη ακολουθία UTF-8. Απόδειξε ότι το errors='replace' αλλάζει τα δεδομένα, ενώ το surrogateescape επιτρέπει ακριβή επιστροφή στα αρχικά bytes.
