# SQLite — δεσμευμένες παράμετροι, αναίρεση και σχέδιο αναζήτησης

## Σενάριο και κριτήρια επιτυχίας
Μία τοπική βάση σημειώσεων έχει εγγραφές και ετικέτες που αναφέρονται σε υπαρκτές σημειώσεις. Όταν μία συναλλαγή προσθέτει σημείωση και μετά επιχειρεί ετικέτα με ανύπαρκτο αναγνωριστικό, δεν πρέπει να παραμένει η πρώτη προσθήκη. Οι τίτλοι περνούν ως δεσμευμένες τιμές, όχι ως κείμενο εντολής SQL. Ακόμη και κείμενο που μοιάζει με επίθεση πρέπει να αντιμετωπίζεται ως απλή τιμή.

## Εκτελέσιμο εργαστήριο — ενσωματωμένη βιβλιοθήκη Python 3
Αποθήκευσε τον κώδικα ως `07_sql.py` και εκτέλεσέ τον με Python 3. Χρησιμοποιεί μόνο τεχνητά δεδομένα και εμφανίζει PASS αν περάσουν οι έλεγχοι. Ο κώδικας είναι ίδιος και στις δύο γλωσσικές εκδόσεις.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE note(id INTEGER PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE label(id INTEGER PRIMARY KEY, note_id INTEGER NOT NULL
  REFERENCES note(id), name TEXT NOT NULL);
""")
with db:
    db.execute("INSERT INTO note VALUES (?, ?)", (1, "first"))
before = db.execute("SELECT count(*) FROM note").fetchone()[0]
try:
    with db:
        db.execute("INSERT INTO note VALUES (?, ?)", (2, "temporary"))
        db.execute("INSERT INTO label VALUES (?, ?, ?)", (8, 99, "bad"))
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT count(*) FROM note").fetchone()[0] == before
attack = "' OR 1=1 --"
assert db.execute("SELECT count(*) FROM note WHERE title=?", (attack,)).fetchone()[0] == 0
db.execute("CREATE INDEX note_title_idx ON note(title)")
plan = db.execute("EXPLAIN QUERY PLAN SELECT * FROM note WHERE title=?", ("first",)).fetchall()
assert any("note_title_idx" in row[3] for row in plan)
assert db.execute("PRAGMA foreign_keys").fetchone()[0] == 1
db.close()
print("PASS sqlite transaction and bindings")
~~~

## Τεχνική εξήγηση
Τα ερωτηματικά των παραμέτρων διαχωρίζουν τη σύνταξη SQL από τις τιμές χρήστη. Στην SQLite ενεργοποιούμε τους περιορισμούς ξένων κλειδιών σε κάθε σύνδεση και τους εξετάζουμε με PRAGMA foreign_keys. Η συναλλαγή διατηρεί τις σχετικές αλλαγές ως σύνολο: αν η δεύτερη εγγραφή αποτύχει με IntegrityError, αναιρείται και η πρώτη. Ένα ευρετήριο μπορεί να επιταχύνει την ισότητα τίτλων, αλλά αυξάνει το κόστος ενημέρωσης· το EXPLAIN QUERY PLAN δείχνει την επιλεγμένη διαδρομή.

## Περιορισμένες ασκήσεις
Δοκίμασε προσωρινά βάση με ενεργά και ανενεργά foreign keys και σύγκρινε τον αριθμό εγγραφών. Πρόσθεσε έγκυρη ετικέτα και μετά μία με άγνωστο note_id. Σύγκρινε νοητικά τη δέσμευση `?` με επικίνδυνη σύνθεση συμβολοσειρών, χωρίς να εκτελέσεις μη ασφαλές ερώτημα. Με δύο συνδέσεις παρατήρησε πότε γίνονται ορατές οι αλλαγές.

## Διάγνωση και τεκμήρια επιτυχίας
Αν περάσει άκυρη αναφορά, έλεγξε την τιμή PRAGMA foreign_keys στην ίδια σύνδεση. Αν η αναζήτηση αργεί, εξέτασε το σχέδιο και το πλήθος γραμμών, όχι μόνο μία μέτρηση. Σε σύγκρουση εγγραφής χειρίσου ρητά SQLITE_BUSY με περιορισμένη αναμονή.
