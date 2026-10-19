# SQLite no such table: λείπει ο πίνακας ή άνοιξες λάθος αρχείο;

## Ακριβής διάγνωση
Μια σύνδεση SQLite μπορεί να πετύχει και να δείχνει σε άδεια βάση. Το sqlite3.connect('name.db') δημιουργεί αρχείο αν δεν υπάρχει· η επόμενη SELECT ίσως αποτύχει με no such table. Άλλες αιτίες είναι migration που δεν εφαρμόστηκε, πίνακας σε attached database ή λάθος όνομα SQL.

## Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~python
import sqlite3
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as root:
    file = Path(root) / "catalog.db"
    db = sqlite3.connect(file)
    try:
        db.execute("SELECT * FROM products")
    except sqlite3.OperationalError as exc:
        assert "no such table" in str(exc)
    db.execute("CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT NOT NULL)")
    db.execute("INSERT INTO products(name) VALUES (?)", ("book",))
    assert db.execute("SELECT name FROM products").fetchone()[0] == "book"
    print(db.execute("PRAGMA database_list").fetchall())
    db.close()
~~~

## Διαδικασία επίλυσης
Κατέγραψε την πλήρη διαδρομή βάσης, χωρίς να δημοσιοποιείς ευαίσθητες τοπικές διαδρομές. Επιθεώρησε PRAGMA database_list και SELECT name,sql FROM sqlite_schema WHERE type='table'. Δες ποιο migration εκτελέστηκε και σε ποιο schema. Για διάγνωση μόνο ανάγνωσης χρησιμοποίησε URI mode=ro ώστε να μη δημιουργείται κρυφά άδειο αρχείο.

## Εργαστήριο / δοκιμή ορίων
Τρέξε το πείραμα με δύο διαφορετικές προσωρινές διαδρομές και εξήγησε γιατί δύο αρχεία catalog.db δεν είναι ίδια βάση. Πρόσθεσε στην εκκίνηση έλεγχο έκδοσης schema με σαφή αποτυχία όταν λείπει migration.
