# Συναλλακτικό outbox και διπλή παράδοση συμβάντων

## Μηχανισμός και συμβόλαιο

Η ενημέρωση βάσης και η δημοσίευση συμβάντος είναι δύο χωριστές επιδράσεις. Κατάρρευση ανάμεσά τους αφήνει αλλαγή χωρίς ειδοποίηση ή ειδοποίηση για ακυρωμένη αλλαγή. Το outbox αποθηκεύει επιχειρησιακή μεταβολή και εκκρεμές συμβάν στην ίδια συναλλαγή. Ξεχωριστός publisher παραδίδει αργότερα τα συμβάντα.

Ο publisher μπορεί να καταρρεύσει αφού ο παραλήπτης δεχτεί το συμβάν αλλά πριν σημειώσει παράδοση. Άρα το outbox συνήθως παρέχει παράδοση τουλάχιστον μία φορά, όχι αυτόματη επεξεργασία ακριβώς μία φορά. Οι καταναλωτές χρειάζονται σταθερά ID και ατομική καταγραφή αποδιπλοποίησης μαζί με την τοπική επίδραση. Το παράδειγμα αποδεικνύει μόνο το όριο ατομικότητας βάσης, χωρίς προσομοίωση δικτύου.

## Τοπικό παράδειγμα

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(":memory:")) as db:
    db.executescript("CREATE TABLE orders(id TEXT PRIMARY KEY);"
                     "CREATE TABLE outbox(id TEXT PRIMARY KEY, body TEXT);")
    try:
        with db:
            db.execute("INSERT INTO orders VALUES (?)", ("order-1",))
            db.execute("INSERT INTO outbox VALUES (?,?)", ("event-1","created"))
            raise RuntimeError("fixture crash before commit")
    except RuntimeError:
        pass
    assert db.execute("SELECT count(*) FROM orders").fetchone() == (0,)
    assert db.execute("SELECT count(*) FROM outbox").fetchone() == (0,)
print("both effects rolled back")
```

## Έλεγχοι αποτυχίας και όρια

Επανάλαβε με επιτυχή δέσμευση και επαλήθευσε και τις δύο γραμμές. Όρισε υπεύθυνο επαναλήψεων, χειρισμό προβληματικών συμβάντων, συναγερμούς ηλικίας και διατήρηση αναγνωριστικών. Μη διαγράφεις outbox πριν ικανοποιηθεί το συμβόλαιο παράδοσης. Δοκίμασε χωριστά αποδιπλοποίηση παραλήπτη· η συναλλαγή πηγής δεν εγγυάται ατομικότητα σε άσχετο απομακρυσμένο σύστημα.

## Πρωτογενής αναφορά

[Επίσημη τεκμηρίωση](https://www.sqlite.org/lang_transaction.html)
