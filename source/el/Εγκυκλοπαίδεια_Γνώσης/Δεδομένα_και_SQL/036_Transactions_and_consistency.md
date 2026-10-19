# Συναλλαγές βάσεων — μεταφορά ποσού χωρίς μερική αποθήκευση

## Συμβόλαιο δεδομένων
Ένα τοπικό βιβλίο υπολοίπων μεταφέρει θετικό ακέραιο ποσό σε λεπτά από έναν υπαρκτό λογαριασμό σε άλλον. Κανένα υπόλοιπο δεν επιτρέπεται να γίνει αρνητικό. Η επιτυχημένη μεταφορά διατηρεί το άθροισμα όλων των υπολοίπων. Αν ο λογαριασμός προορισμού λείπει ή δεν υπάρχουν αρκετά χρήματα, **κανένα** υπόλοιπο δεν πρέπει να αλλάξει. Οι δύο εντολές UPDATE ανήκουν στην ίδια συναλλαγή. Μην αναφέρεις ολοκλήρωση αν πέτυχε μόνο η αφαίρεση.

## Εκτελέσιμο εργαστήριο Python 3 και SQLite
Αποθήκευσε ως transfer_lab.py και εκτέλεσε python3 transfer_lab.py. Η βάση υπάρχει μόνο στη μνήμη και περιέχει τεχνητά ποσά. Οι τιμές περνούν ως παράμετροι και μία δοκιμή αποτυγχάνει σκόπιμα σε άγνωστο προορισμό.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("""CREATE TABLE wallet(
    id INTEGER PRIMARY KEY,
    balance INTEGER NOT NULL CHECK(balance >= 0))""")
db.executemany("INSERT INTO wallet VALUES (?,?)",[(1,100),(2,0)])
db.commit()

def transfer(src, dst, amount):
    if type(amount) is not int or amount <= 0 or src == dst:
        raise ValueError("invalid transfer")
    with db:
        old = db.execute("SELECT balance FROM wallet WHERE id=?", (src,)).fetchone()
        if old is None or old[0] < amount:
            raise ValueError("insufficient or unknown source")
        db.execute("UPDATE wallet SET balance=balance-? WHERE id=?", (amount,src))
        updated = db.execute("UPDATE wallet SET balance=balance+? WHERE id=?",
                             (amount,dst)).rowcount
        if updated != 1:
            raise ValueError("unknown destination")

transfer(1,2,40)
assert db.execute("SELECT sum(balance) FROM wallet").fetchone()[0] == 100
try:
    transfer(1,99,10)
except ValueError:
    pass
else:
    raise AssertionError("unknown destination accepted")
assert db.execute("SELECT balance FROM wallet WHERE id=1").fetchone()[0] == 60
print("PASS: atomic transfer and rollback")
~~~

## Γιατί γίνεται αναίρεση
Ο διαχειριστής συμφραζομένων της σύνδεσης ολοκληρώνει τη συναλλαγή όταν όλες οι εντολές πετύχουν και την αναιρεί αν μεταδοθεί ValueError. Άρα η πρώτη αφαίρεση της αποτυχημένης μεταφοράς αναιρείται όταν η δεύτερη UPDATE δεν βρίσκει λογαριασμό. Ο περιορισμός CHECK αποτρέπει αρνητικά υπόλοιπα, αλλά δεν εγγυάται ότι υπάρχει προορισμός και δεν επιλύει κάθε σύγκρουση ταυτόχρονων εγγραφών. Για βάση σε αρχείο με πολλούς χρήστες απαιτούνται ξεχωριστοί έλεγχοι κλειδώματος και απομόνωσης.

## Ασκήσεις και διαγνωστικά
1. Ζήτησε ποσό μεγαλύτερο από το υπόλοιπο, μηδενικό ποσό, boolean και άγνωστη πηγή. Βεβαιώσου ότι όλα απορρίπτονται χωρίς αλλαγές.
2. Αφαίρεσε προσωρινά τον έλεγχο πλήθους αλλαγμένων γραμμών στον προορισμό. Παρατήρησε το παραπλανητικό αποτέλεσμα και αποκατάστησέ τον.
3. Προκάλεσε εξαίρεση αφού μεταβάλεις δύο διαφορετικούς λογαριασμούς στην ίδια συναλλαγή. Και οι δύο αλλαγές πρέπει να αναιρεθούν.
4. Δοκίμασε προσωρινή βάση σε αρχείο με δύο συνδέσεις και παρατήρησε την ορατότητα πριν και μετά την οριστικοποίηση.

**Παραδοτέα:** PASS, σταθερό άθροισμα υπολοίπων, αναίρεση άγνωστου προορισμού και διαχωρισμός ατομικότητας από απομόνωση.
