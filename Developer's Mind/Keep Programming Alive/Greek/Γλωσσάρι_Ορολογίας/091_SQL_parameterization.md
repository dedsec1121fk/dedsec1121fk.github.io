# SQL parameterization — οι τιμές παραμένουν δεδομένα

## Όριο εμπιστοσύνης
Το SQL placeholder αναπαριστά **τιμή**, όχι μέρος της σύνταξης SQL. Η σύνδεση παραμέτρων εμποδίζει το εισερχόμενο κείμενο να αλλάξει τη δομή του ερωτήματος. Δεν εξασφαλίζει όμως ότι μια ποσότητα είναι έγκυρη ή ότι ο χρήστης έχει άδεια πρόσβασης. Ονόματα πινάκων/στηλών και ORDER BY χρειάζονται ρητή allowlist, όχι placeholders.

## Εκτελέσιμο παράδειγμα sqlite3
~~~python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE inventory (sku TEXT PRIMARY KEY, qty INTEGER)")
db.executemany(
    "INSERT INTO inventory(sku, qty) VALUES (?, ?)",
    [("bolt", 4), ("nut", 2)],
)
input_sku = "bolt' OR 1=1 --"
found = db.execute(
    "SELECT qty FROM inventory WHERE sku = ?", (input_sku,)
).fetchall()
assert found == []
valid = db.execute(
    "SELECT qty FROM inventory WHERE sku = ?", ("bolt",)
).fetchone()
assert valid == (4,)
db.close()
~~~
Το κείμενο με απόστροφο παραμένει τιμή SKU, δεν δημιουργεί νέο OR όρο. Η απορριπτέα αναζήτηση δεν επιστρέφει γραμμή. Με απλή συνένωση strings σε SQL το συμβόλαιο αυτό θα παραβιαζόταν.

## Ελεγχόμενες επεκτάσεις
1. Αποθήκευσε κανονικό SKU με απόστροφο και αναζήτησέ το με parameter, χωρίς χειροκίνητο escaping.
2. Δοκίμασε placeholder στη θέση ονόματος πίνακα. Κατάγραψε το syntax error και επέλεξε table μέσω σταθερού mapping.
3. Για user-sort χρησιμοποίησε λίστα προκαθορισμένων πεδίων, όχι raw input στο ORDER BY.
4. Δοκίμασε -5 ως ποσότητα. Το binding δεν την απορρίπτει χωρίς CHECK constraint ή άλλη validation.
5. Εκτέλεσε δύο εγγραφές σε transaction και προκάλεσε constraint failure. Έλεγξε την κατάσταση μετά το rollback.

## Κριτήριο επιτυχίας
Εκτέλεσε τις assertions σε SQLite μνήμης και βεβαιώσου ότι κανένα input δεν ενσωματώνεται σε SQL syntax. Διαφορετικοί drivers έχουν άλλα placeholders. Χρειάζονται επιπλέον authorization και περιορισμένα DB permissions.
