# SQLite database is locked: αναπαραγωγή σύγκρουσης writers με ασφάλεια

## Ακριβής διάγνωση
Η SQLite δέχεται παράλληλους readers αλλά συντονίζει τις εγγραφές ώστε να μη γράφουν πολλοί ταυτόχρονα. Ένα ανοικτό write transaction μπλοκάρει άλλο connection. Το timeout καθορίζει αναμονή, όχι αν μια επανάληψη είναι ασφαλής. Μεγάλα transactions, ενεργοί cursors και ξεχασμένο rollback προκαλούν επίμονα locks.

## Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~python
import sqlite3
from tempfile import TemporaryDirectory
from pathlib import Path
with TemporaryDirectory() as d:
    file = Path(d) / "test.db"
    one = sqlite3.connect(file, timeout=0)
    two = sqlite3.connect(file, timeout=0)
    one.execute("CREATE TABLE events(v INTEGER)")
    one.commit()
    try:
        one.execute("BEGIN IMMEDIATE")
        one.execute("INSERT INTO events VALUES (1)")
        try:
            two.execute("INSERT INTO events VALUES (2)")
        except sqlite3.OperationalError as exc:
            assert "locked" in str(exc).lower()
        else:
            raise AssertionError("second writer unexpectedly succeeded")
    finally:
        one.rollback()
    two.execute("INSERT INTO events VALUES (2)")
    two.commit()
    one.close()
    two.close()
~~~

## Διαδικασία επίλυσης
Εντόπισε ποιο connection κρατά μη ολοκληρωμένο transaction. Χρησιμοποίησε σύντομες συναλλαγές, ρητό close/rollback και περιορισμένο busy timeout. Το WAL βοηθά τη συνύπαρξη readers/writer αλλά δεν επιτρέπει δύο ταυτόχρονους SQLite writers. Κατάγραψε διάρκειες requests και όρια transactions πριν αυξήσεις το timeout.

## Εργαστήριο / δοκιμή ορίων
Αντικατάστησε το rollback με commit μετά την αποδέσμευση του transaction και έλεγξε το πλήθος γραμμών. Εξήγησε γιατί η αυτόματη επανάληψη μπορεί να διπλοεγγράψει μια πληρωμή και σχεδίασε idempotency key πριν από retry.
