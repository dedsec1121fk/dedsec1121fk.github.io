# Η σωστή SQL δεν αρκεί για αξιόπιστο schema migration

## Δοκιμή σε απομονωμένη βάση μνήμης
Φτιάξε πίνακα με constraint μη αρνητικής ποσότητας και χειρίσου την ενημέρωση μέσω ρητής συναλλαγής. Η βάση `:memory:` δεν αγγίζει πραγματικά δεδομένα. Σε αποτυχία constraint έλεγξε ότι η προηγούμενη τιμή παραμένει ίδια και δεν ολοκληρώθηκε μισή αλλαγή.

~~~python
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE stock (sku TEXT PRIMARY KEY, quantity INTEGER NOT NULL CHECK(quantity>=0))')
con.execute('INSERT INTO stock VALUES (?, ?)', ('A1', 3))
con.commit()
try:
    con.execute('BEGIN')
    con.execute('UPDATE stock SET quantity=? WHERE sku=?', (-2, 'A1'))
    con.commit()
except sqlite3.IntegrityError:
    con.rollback()
assert con.execute('SELECT quantity FROM stock').fetchone()[0] == 3
~~~

## Γιατί απορρίφθηκε η εντολή;
Το CHECK constraint απαγορεύει αρνητική τιμή. Το UPDATE έγινε μέσα σε transaction και σε αποτυχία πρέπει να ακολουθήσει rollback. Αλλιώς η σύνδεση μπορεί να παραμείνει σε κατάσταση που ο καλών δεν περίμενε. Διαφορετικές ρυθμίσεις autocommit απαιτούν ρητή τεκμηρίωση.

## Σχέδιο migration πραγματικής βάσης
Πάρε πρώτα επαληθευμένο backup, εξέτασε `PRAGMA user_version` και δοκίμασε την αλλαγή σε αντιπροσωπευτικό αντίγραφο. Αν προσθέσεις NOT NULL column χρειάζεται πολιτική για τις υπάρχουσες εγγραφές. Δεν υπάρχει εγγύηση ότι κάθε ALTER TABLE αντιστρέφεται εύκολα χωρίς απώλεια δεδομένων.

## Τεστ παράδοσης
Δοκίμασε έγκυρη και μη έγκυρη ενημέρωση, επιβεβαίωσε rollback και δες τη δομή με `PRAGMA table_info(stock)`. Χρησιμοποίησε παραμέτρους SQL αντί να ενώνεις strings από χρήστη. Το παράδειγμα δεν αποδεικνύει συμπεριφορά άλλων database servers.

## Δοκίμασε τη συναλλαγή της ίδιας της αλλαγής schema
Το αρχικό παράδειγμα ελέγχει constraint εγγραφής, όχι migration schema. Το παρακάτω ανεξάρτητο πείραμα ελέγχει επαναφορά DDL μετά από αποτυχία. Χρησιμοποιεί explicit SQL συναλλαγές με `isolation_level=None`, χωρίς εξάρτηση από μεταβαλλόμενες implicit προεπιλογές Python.
~~~python
import sqlite3
con = sqlite3.connect(':memory:', isolation_level=None)
con.execute('CREATE TABLE notes (body TEXT NOT NULL)')
con.execute('INSERT INTO notes VALUES (?)', ('keep me',))
con.execute('BEGIN IMMEDIATE')
try:
    con.execute('ALTER TABLE notes ADD COLUMN flag INTEGER NOT NULL DEFAULT 0')
    con.execute('PRAGMA user_version=1')
    raise RuntimeError('simulated migration interruption')
except RuntimeError:
    con.execute('ROLLBACK')
assert [r[1] for r in con.execute('PRAGMA table_info(notes)')] == ['body']
assert con.execute('PRAGMA user_version').fetchone()[0] == 0
assert con.execute('SELECT body FROM notes').fetchone()[0] == 'keep me'
con.close()
~~~
Επανάλαβε χωρίς τη συνθετική διακοπή και βάλε COMMIT στη διαδρομή επιτυχίας. Νέα στήλη και schema version πρέπει να εμφανίζονται μαζί. Η συναλλαγή δεν αντικαθιστά δοκιμασμένο backup πραγματικής βάσης. Έλεγξε χωριστά συμπεριφορές του driver όπως το executescript, που δεν έχει υποχρεωτικά τα ίδια transaction boundaries με διαδοχικά execute.

Το BEGIN IMMEDIATE μπορεί να αποτύχει πριν από οποιαδήποτε αλλαγή όταν άλλη σύνδεση κρατά write transaction. Χειρίσου το busy αποτέλεσμα χωριστά από λάθος migration SQL. Μην επαναλαμβάνεις τυφλά αλλαγές schema μετά από αβέβαιο μερικό αποτέλεσμα.

Πηγές: [SQLite transactions](https://www.sqlite.org/lang_transaction.html) και [Python sqlite3](https://docs.python.org/3/library/sqlite3.html).
## Σημεία αποθήκευσης και μερική αναίρεση συναλλαγής

Το savepoint ορίζει όριο αναίρεσης μέσα σε μεγαλύτερη συναλλαγή. Η επιστροφή σε αυτό αναιρεί επόμενες αλλαγές και διατηρεί προηγούμενη εργασία και εξωτερική συναλλαγή. Το release δεν δεσμεύει ανεξάρτητα μόνιμη αποθήκευση· εξωτερικό rollback μπορεί ακόμη να αναιρέσει τις αλλαγές.

Χρησιμοποίησέ το όταν προαιρετικό στοιχείο παρτίδας μπορεί να αποτύχει με ρητό συμβόλαιο μερικής επιτυχίας. Αν ο επιχειρησιακός κανόνας απαιτεί κοινή επιτυχία όλων, η μερική ανάκαμψη τον παραβιάζει ακόμη και με έγκυρη SQL.

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(":memory:")) as db:
    db.execute("CREATE TABLE items(id INTEGER PRIMARY KEY)")
    db.execute("BEGIN")
    db.execute("INSERT INTO items VALUES (1)")
    db.execute("SAVEPOINT optional_item")
    db.execute("INSERT INTO items VALUES (2)")
    db.execute("ROLLBACK TO optional_item")
    db.execute("RELEASE optional_item")
    db.commit()
    assert db.execute("SELECT id FROM items").fetchall() == [(1,)]
print("outer work preserved")
```

Πρόσθεσε τελικό εξωτερικό rollback και απόδειξε ότι χάνονται ακόμη και αλλαγές απελευθερωμένου εσωτερικού σημείου. Τα ονόματα savepoint ελέγχονται από το πρόγραμμα και δεν προέρχονται από εξωτερική ετικέτα. Κατάγραψε αποδεκτά στοιχεία χωρίς ανεπιφύλακτη αναφορά επιτυχίας μερικής παρτίδας.

[Τεχνική αναφορά](https://www.sqlite.org/lang_savepoint.html)
