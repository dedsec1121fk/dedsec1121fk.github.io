# Ζωντανό αντίγραφο SQLite και ασκήσεις επαναφοράς

## Μηχανισμός και συμβόλαιο

Μια ενεργή βάση SQLite μπορεί να έχει δεσμευμένες σελίδες στο αρχείο WAL. Η αντιγραφή μόνο του κύριου αρχείου ενώ εκτελούνται εγγραφές δεν εξασφαλίζει συνεπές αντίγραφο. Χρησιμοποίησε σύνδεση βάσης ως πηγή στιγμιοτύπου και ξεχωριστή σύνδεση προορισμού. Το παράδειγμα δημιουργεί αναλώσιμα δεδομένα σε προσωρινό κατάλογο και δεν ανοίγει βάση εφαρμογής.

Ένα αντίγραφο έχει αξία όταν η εφαρμογή μπορεί να διαβάσει την επαναφορά. Το ερώτημα πρέπει να επιστρέψει ακριβώς μία εγγραφή και το integrity_check την τιμή ok. Ένα σωστό άθροισμα ελέγχου αποδεικνύει ταυτότητα bytes, όχι χρηστικό σχήμα και δεδομένα. Σε πραγματικό σχέδιο ανάκαμψης κατάγραψε εκδόσεις βάσης και εφαρμογής, χρόνο αντιγράφου, εξαρτήσεις κρυπτογράφησης και ξεχωριστή τοποθεσία αποθήκευσης.

## Τοπικό παράδειγμα

```python
import sqlite3, tempfile
from contextlib import closing
from pathlib import Path
with tempfile.TemporaryDirectory() as folder:
    root = Path(folder)
    with closing(sqlite3.connect(root / "live.db")) as src:
        src.execute("PRAGMA journal_mode=WAL")
        src.execute("CREATE TABLE notes(id INTEGER PRIMARY KEY, body TEXT)")
        src.execute("INSERT INTO notes(body) VALUES (?)", ("fixture",))
        src.commit()
        with closing(sqlite3.connect(root / "restore.db")) as dst:
            src.backup(dst)
            assert dst.execute("PRAGMA integrity_check").fetchone() == ("ok",)
            assert dst.execute("SELECT body FROM notes").fetchall() == [("fixture",)]
print("backup restored")
```

## Έλεγχοι αποτυχίας και όρια

Αφαίρεσε σκόπιμα μία εγγραφή σε δεύτερο δοκιμαστικό σύνολο και βεβαιώσου ότι ο έλεγχος εφαρμογής αποτυγχάνει ακόμη κι αν το integrity_check λέει ok. Μη διαγράφεις WAL για «επισκευή» ενεργής βάσης. Περιόρισε τη διάρκεια αντιγράφων, παρακολούθησε τον χώρο και εξασκήσου χωρίς αντικατάσταση του πρωτοτύπου.

## Πρωτογενής αναφορά

[Επίσημη τεκμηρίωση](https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.backup)
