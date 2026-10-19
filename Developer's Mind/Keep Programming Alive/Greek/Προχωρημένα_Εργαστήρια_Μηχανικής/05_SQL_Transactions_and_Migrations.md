# Μεταβολές σχήματος SQLite — επανάληψη και επαναφορά μετά από αποτυχία

## Σενάριο και αμετάβλητος κανόνας
Μία εφαρμογή σημειώσεων χωρίς σύνδεση ξεκινά με πίνακα εργασιών έκδοσης ένα, όπου κάθε εγγραφή έχει ακέραιο κλειδί και μοναδικό μη κενό τίτλο. Η δεύτερη έκδοση προσθέτει σημαία ολοκλήρωσης που δέχεται μόνο μηδέν ή ένα. Η αναβάθμιση υπάρχουσας βάσης πρέπει να επαναλαμβάνεται χωρίς διαγραφή σημειώσεων. Τα ονόματα πινάκων προέρχονται από έμπιστο κώδικα και οι τιμές του χρήστη μπαίνουν με δεσμευμένες παραμέτρους. Μία αποτυχημένη ομάδα εγγραφών δεν πρέπει να αφήνει τη βάση σε ενδιάμεση κατάσταση.

## Εκτελέσιμο εργαστήριο Python 3
Αποθήκευσε ως migration_lab.py και εκτέλεσε python3 migration_lab.py. Η βάση βρίσκεται στη μνήμη. Ελέγχονται αρχική αναβάθμιση, επανάληψη χωρίς διπλές αλλαγές, αναίρεση μετά από διπλό τίτλο και έλεγχος ακεραιότητας.

~~~python
import sqlite3

def migrate(db):
    current = db.execute('PRAGMA user_version').fetchone()[0]
    if current > 2:
        raise ValueError('database is newer than this program')
    with db:
        if current == 0:
            db.execute('CREATE TABLE task(id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)')
            db.execute('PRAGMA user_version = 1')
            current = 1
        if current == 1:
            db.execute('ALTER TABLE task ADD COLUMN done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1))')
            db.execute('PRAGMA user_version = 2')

with sqlite3.connect(':memory:') as db:
    migrate(db)
    migrate(db)  # migration is idempotent
    assert db.execute('PRAGMA user_version').fetchone()[0] == 2
    with db:
        db.execute('INSERT INTO task(title) VALUES (?)', ('alpha',))
    before = db.execute('SELECT COUNT(*) FROM task').fetchone()[0]
    try:
        with db:
            db.execute('INSERT INTO task(title) VALUES (?)', ('temporary',))
            db.execute('INSERT INTO task(title) VALUES (?)', ('alpha',))
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError('UNIQUE failed to reject a duplicate')
    assert db.execute('SELECT COUNT(*) FROM task').fetchone()[0] == before
    assert db.execute('SELECT done FROM task').fetchall() == [(0,)]
    assert db.execute('PRAGMA integrity_check').fetchone() == ('ok',)
print('PASS SQL migration: version, idempotency, UNIQUE, rollback, integrity')
~~~

## Κατανόηση των συναλλαγών
Το PRAGMA user_version κρατά αριθμό έκδοσης μέσα στο αρχείο SQLite. Η συνάρτηση διαβάζει την έκδοση και εκτελεί μόνο τα βήματα που λείπουν, μέσα σε συναλλαγή. Η νέα στήλη χρησιμοποιεί NOT NULL DEFAULT 0 για έγκυρη αρχική τιμή, ενώ το CHECK περιορίζει τις μελλοντικές εγγραφές. Ο περιορισμός UNIQUE αποτρέπει διπλούς τίτλους ακόμη και όταν ο προγραμματιστής ξεχάσει τον έλεγχο στην εφαρμογή. Στη δοκιμή αποτυχίας εισάγεται αρχικά η temporary, αλλά η δεύτερη προσπάθεια για alpha προκαλεί IntegrityError. Η συναλλαγή αναιρείται ολόκληρη, επομένως δεν διατηρείται η προσωρινή εγγραφή. Η συμπεριφορά συνδέεται με τον τρόπο συναλλαγών της βιβλιοθήκης και της βάσης, γι' αυτό χρειάζεται επαλήθευση στο πραγματικό περιβάλλον. Ο διαχειριστής with db δεν κλείνει αυτομάτως τη σύνδεση.

## Ελεγχόμενες ασκήσεις και προστασία δεδομένων
1. Φτιάξε προσωρινή βάση έκδοσης ένα με πραγματικές δοκιμαστικές εγγραφές, αναβάθμισέ την και απόδειξε ότι τίτλοι και νέα προεπιλεγμένη τιμή διατηρούνται.
2. Προκάλεσε σφάλμα στη μέση μιας μεταβολής σχήματος και εξέτασε PRAGMA user_version και sqlite_master. Μη θεωρείς δεδομένη την ατομικότητα χωρίς δοκιμή των πραγματικών εντολών.
3. Δοκίμασε δύο συνδέσεις σε προσωρινό αρχείο βάσης και κατέγραψε τι βλέπει ο αναγνώστης πριν και μετά το commit. Χειρίσου SQLITE_BUSY χωρίς κατάργηση περιορισμών.
4. Απόρριψε βάση με μεγαλύτερο user_version από την εφαρμογή. Δημιούργησε και επανάφερε επιτυχώς ένα δοκιμαστικό backup πριν από πραγματική αναβάθμιση.

**Παραδοτέα:** PASS, πλήθη εγγραφών πριν και μετά το σφάλμα, μεταβολές user_version, integrity_check και δοκιμασμένο σχέδιο αντιγράφου ασφαλείας. Μην εκτελείς αυτό το εργαστήριο σε προσωπικές βάσεις.
## Πρόσθετη τεχνική ανάλυση

Προστάτεψε αλλαγή με την αρχικά αναγνωσμένη έκδοση και όχι μόνο το ID γραμμής. Θεώρησε μηδενικές επηρεασμένες γραμμές πιθανή σύγκρουση και διατήρησε τον νικητή. Η συναλλαγή δίνει ατομική εκτέλεση, ενώ η ρητή συνθήκη έκδοσης δίνει τον κανόνα που εμποδίζει σιωπηρή αντικατάσταση αλλαγής άλλου συντάκτη.

[Αισιόδοξος συγχρονισμός και αποτροπή χαμένων ενημερώσεων](#read:fieldnotes-el-39)
