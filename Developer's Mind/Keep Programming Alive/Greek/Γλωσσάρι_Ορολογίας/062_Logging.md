# Γλωσσάρι: καταγραφή, διαρροές μνήμης και migrations

## Logging

### Έννοια και όρια
Καταγραφή συμβάντων με severity, timestamps και correlation IDs για διάγνωση. Τα logs μπορούν να εκθέσουν tokens ή προσωπικά στοιχεία χωρίς σωστό sanitization.

### Πρακτικό δείγμα
~~~text
import logging
logging.basicConfig(level=logging.INFO)
logging.info('processed %d records',3)
~~~

### Οδηγούμενη διερεύνηση
Κατέγραψε απορριφθείσα εγγραφή με συνθετικό request ID χωρίς credentials. Έλεγξε ποια fields φτάνουν στον handler, όχι μόνο το console.

### Κριτήριο κατανόησης
Στην έννοια Καταγραφή συμβάντων, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## Memory leak

### Έννοια και όρια
Ακούσια διατήρηση αντικειμένων πέρα από τη χρήσιμη διάρκεια ζωής τους. Μακρόβιες caches, callbacks και references προκαλούν προβλήματα ακόμη και με garbage collector. Μεγάλη μνήμη δεν σημαίνει πάντα leak.

### Πρακτικό δείγμα
~~~text
from collections import deque
recent=deque(maxlen=10)
for n in range(10000): recent.append(n)
assert len(recent)==10
~~~

### Οδηγούμενη διερεύνηση
Σύγκρινε unbounded list με bounded deque σε επαναλαμβανόμενες εισόδους. Χρησιμοποίησε tracemalloc snapshots για retained allocations.

### Retained references που παρατείνουν τη ζωή objects
Ένα object μπορεί να παραμένει προσβάσιμο από registry παρότι η αρχική τοπική μεταβλητή διαγράφτηκε. Το weak reference επιτρέπει έλεγχο χωρίς τεράστια allocations.

~~~python
import gc, weakref
class Entry: pass
registry = []
entry = Entry()
watch = weakref.ref(entry)
registry.append(entry)
del entry
gc.collect()
assert watch() is not None
registry.clear()
gc.collect()
assert watch() is None
~~~

Σχεδίασε cache με όριο 100 entries και μέτρησε objects μετά από χιλιάδες διαφορετικά keys. Μόνο το RSS δεν αποδεικνύει leak: ο allocator μπορεί να κρατά ελεύθερα pools.

## Migration

### Έννοια και όρια
Ελεγχόμενη αναβάθμιση schema ή έκδοσης. Migration λαμβάνει υπόψη παλιές γραμμές, σταδιακό deployment και επιλογές rollback, όχι μόνο μία αλλαγή σχήματος.

### Πρακτικό δείγμα
~~~text
CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT);
ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
~~~

### Οδηγούμενη διερεύνηση
Χρησιμοποίησε προσωρινή SQLite με παλιές γραμμές· έλεγξε ότι το νέο archived είναι 0 και σχεδίασε rollback.

### Κριτήριο κατανόησης
Στην έννοια Μετάβαση σχήματος, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

### Αλλαγή schema χωρίς απώλεια παλιών εγγραφών
Μία migration είναι σωστή όταν οι υπάρχουσες εγγραφές παραμένουν έγκυρες και το νέο schema υποστηρίζεται από την εφαρμογή.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT)")
db.execute("INSERT INTO tasks(title) VALUES (?)", ("review",))
with db:
    db.execute("ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0")
assert db.execute("SELECT title,archived FROM tasks").fetchone() == ("review",0)
db.close()
~~~

Πρόσθεσε PRAGMA user_version και εκτέλεσε upgrade δύο φορές. Τη δεύτερη πρέπει να ανιχνεύεται ότι έχει ήδη εφαρμοστεί. Για destructive migrations σχεδίασε backup/rollback πριν από αλλαγές. Τα DDL semantics διαφέρουν ανά engine.
