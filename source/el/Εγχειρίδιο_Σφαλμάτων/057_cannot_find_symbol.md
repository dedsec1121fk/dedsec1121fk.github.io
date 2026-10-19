# Εντοπισμός λαθών compiler και SQL: ονόματα και constraints

## cannot find symbol

**Γλώσσα / περιβάλλον:** Java

### Τι σημαίνει
Δεν αναγνωρίζεται όνομα, τύπος ή μέθοδος στη μεταγλώττιση.

### Πώς διορθώνεται
Έλεγξε import, πακέτο, όνομα και υπογραφή.

## UNIQUE constraint failed

### Ακριβής διάγνωση
Ένα UNIQUE index προστατεύει μοναδικά αναγνωριστικά ή συνδυασμούς πεδίων. Διπλές εγγραφές μπορούν να προκύψουν από επαναλαμβανόμενο αίτημα, λάθος είσοδο ή race ανάμεσα σε SELECT και INSERT. Ο προηγούμενος έλεγχος SELECT δεν είναι atomic· ο κανόνας της βάσης παραμένει κρίσιμος.

### Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE jobs(key TEXT PRIMARY KEY, attempts INTEGER NOT NULL)")
sql = """INSERT INTO jobs(key, attempts) VALUES (?, 1)
ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1"""
db.execute(sql, ("job-1",))
db.execute(sql, ("job-1",))
assert db.execute("SELECT attempts FROM jobs WHERE key='job-1'").fetchone()[0] == 2
assert db.execute("SELECT COUNT(*) FROM jobs").fetchone()[0] == 1
~~~

### Διαδικασία επίλυσης
Όρισε αν η λειτουργία επιτρέπεται μόνο να δημιουργήσει εγγραφή, να ενημερώσει ή να επαναλάβει το ίδιο συμβάν. Το ON CONFLICT πρέπει να στοχεύει συγκεκριμένο κανόνα. Το INSERT OR REPLACE μπορεί να διαγράψει/ξαναεισάγει και να επηρεάσει IDs, triggers και foreign keys. Για retries που δεν πρέπει να αυξάνουν χρεώσεις απαιτείται idempotency key.

### Εργαστήριο / δοκιμή ορίων
Άλλαξε το παράδειγμα ώστε η επανάληψη job-1 να μην αυξάνει attempts. Πρόσθεσε δεύτερο μοναδικό πεδίο και δες ποιος στόχος ON CONFLICT ενεργοποιείται. Βεβαιώσου ότι άλλες παραβιάσεις ακεραιότητας δεν κρύβονται.

## syntax error near

### Ακριβής διάγνωση
Ένα σφάλμα SQL parser εμφανίζεται πριν εκτελεστεί η εντολή. Το token του μηνύματος είναι το σημείο όπου σταμάτησε η ανάλυση, όχι απαραίτητα η αρχή του προβλήματος. Η σύνταξη διαφέρει ανά engine και έκδοση· μια MySQL εντολή δεν είναι αυτομάτως έγκυρη σε SQLite ή PostgreSQL. Μη συγχέεις τιμές και ονόματα identifiers.

### Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE measures(value INTEGER)")
bad = "INSERT INTO measures(value,) VALUES (3)"
try:
    db.execute(bad)
except sqlite3.OperationalError as exc:
    assert "syntax" in str(exc).lower()
else:
    raise AssertionError("bad SQL parsed")
db.execute("INSERT INTO measures(value) VALUES (?)", (3,))
assert db.execute("SELECT value FROM measures").fetchone() == (3,)
~~~

### Διαδικασία επίλυσης
Κατέγραψε τη SQL εντολή χωρίς πραγματικά προσωπικά parameters. Μείωσε το παράδειγμα στη μικρότερη αποτυχημένη εντολή και σημείωσε engine/έκδοση. Έλεγξε περιττά κόμματα, quotes και δεσμευμένα identifiers. Τα placeholders παραμετροποιούν τιμές, όχι ονόματα πινάκων· για δυναμικά identifiers χρησιμοποίησε allowlist.

### Εργαστήριο / δοκιμή ορίων
Δοκίμασε όνομα πίνακα που είναι δεσμευμένη λέξη, διόρθωσέ το με τους κανόνες quoting του SQL engine και δοκίμασε τιμή με απόστροφο χωρίς χειροκίνητο escaping. Ξεχώρισε parser error από no such column.
