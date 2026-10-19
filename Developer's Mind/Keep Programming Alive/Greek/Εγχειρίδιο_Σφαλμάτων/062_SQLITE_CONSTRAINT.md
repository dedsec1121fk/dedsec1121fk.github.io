# SQLITE_CONSTRAINT: βρες ποιος κανόνας δεδομένων παραβιάστηκε

## Ακριβής διάγνωση
Το SQLITE_CONSTRAINT είναι οικογένεια κωδικών και όχι πλήρης διάγνωση. Η SQLite μπορεί να απορρίψει CHECK, NOT NULL, PRIMARY KEY, UNIQUE ή FOREIGN KEY. Στην Python συνήθως προκύπτει sqlite3.IntegrityError· σε υποστηριζόμενες εκδόσεις υπάρχει sqlite_errorname. Η επανάληψη της ίδιας άκυρης εγγραφής δεν διορθώνει τον κανόνα.

## Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tickets(id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE, qty INTEGER CHECK(qty >= 0))")
db.execute("INSERT INTO tickets(code, qty) VALUES (?, ?)", ("A1", 2))
for record in (("A1", 4), ("B2", -1), (None, 1)):
    try:
        db.execute("INSERT INTO tickets(code, qty) VALUES (?, ?)", record)
    except sqlite3.IntegrityError as exc:
        print(getattr(exc, "sqlite_errorname", "integrity violation"))
    else:
        raise AssertionError("invalid row accepted")
assert db.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 1
~~~

## Διαδικασία επίλυσης
Δες το πραγματικό schema με SELECT sql FROM sqlite_schema WHERE name='tickets' και αντιστοίχισε τον κανόνα με τη λανθασμένη τιμή. Κάνε validation πριν από την εγγραφή αλλά διατήρησε και τον κανόνα στη βάση για προστασία από races. Για πολλές εντολές χρησιμοποίησε transaction. Το INSERT OR REPLACE μπορεί να διαγράψει/ξαναεισάγει γραμμή, άρα δεν είναι γενική λύση.

## Εργαστήριο / δοκιμή ορίων
Πρόσθεσε CHECK με μέγιστη ποσότητα και regression tests στην οριακή τιμή. Εξέτασε αν μια άκυρη εγγραφή επηρεάζει προηγούμενες ολοκληρωμένες εγγραφές και εξήγησε τη διαφορά validation εφαρμογής και ελέγχου βάσης.
