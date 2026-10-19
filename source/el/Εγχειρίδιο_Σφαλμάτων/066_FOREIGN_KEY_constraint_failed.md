# SQLite FOREIGN KEY failed: σχέση parent-child και ενεργοποίηση ελέγχων

## Ακριβής διάγνωση
Μια child γραμμή πρέπει να δείχνει σε υπάρχον parent, εκτός αν το schema ορίζει NULL ή cascade. Σημαντικό: ο έλεγχος foreign keys στη SQLite ρυθμίζεται ανά σύνδεση. Η δήλωση FOREIGN KEY χωρίς PRAGMA foreign_keys=ON μπορεί να μην ενεργοποιεί τον έλεγχο ανάλογα με το περιβάλλον.

## Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
assert db.execute("PRAGMA foreign_keys").fetchone()[0] == 1
db.execute("CREATE TABLE users(id INTEGER PRIMARY KEY)")
db.execute("CREATE TABLE notes(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))")
try:
    db.execute("INSERT INTO notes(user_id) VALUES (99)")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("orphan accepted")
db.execute("INSERT INTO users(id) VALUES (99)")
db.execute("INSERT INTO notes(user_id) VALUES (99)")
assert db.execute("PRAGMA foreign_key_check").fetchall() == []
~~~

## Διαδικασία επίλυσης
Έλεγξε PRAGMA foreign_keys κατά τη δημιουργία σύνδεσης και PRAGMA foreign_key_list(notes) για τους ορισμούς. Σε αποτυχία DELETE εξέτασε ON DELETE: RESTRICT, CASCADE, SET NULL και NO ACTION έχουν διαφορετικές συνέπειες. Διόρθωσε τη σειρά εγγραφών parent/child ή τους κανόνες του συστήματος. Μην απενεργοποιείς συνολικά το enforcement.

## Εργαστήριο / δοκιμή ορίων
Σε αναλώσιμη βάση δοκίμασε διαγραφή parent που έχει child και μετά έκδοση με ON DELETE CASCADE. Έλεγξε ακριβώς ποιες γραμμές απομένουν. Σε υπάρχον αρχείο χρησιμοποίησε PRAGMA foreign_key_check για τυχόν παλαιά ορφανά δεδομένα.
