# sql_sqlite — συγκεντρωτικός οδηγός

## SQL (SQLite)

**Συνήθης χρήση:** Βάσεις και επεξεργασία δεδομένων.

**Προτεινόμενη επέκταση αρχείου:** `.sql`.

**Εκτέλεση / περιβάλλον:** sqlite3 :memory: < hello.sql.

### Αρχικό παράδειγμα

```
CREATE TABLE people (name TEXT NOT NULL);
INSERT INTO people(name) VALUES ('Ada'), ('Grace');
SELECT 'Hello, ' || name || '!' AS greeting FROM people;
```

### Πώς διαβάζεται

Η SQL είναι δηλωτική· στις εφαρμογές χρησιμοποίησε παραμετρικά ερωτήματα.

### Συνηθισμένο λάθος

Η SQL είναι δηλωτική· στις εφαρμογές χρησιμοποίησε παραμετρικά ερωτήματα. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Σχεδίαση δεδομένων και transactions πριν από queries
Η SQL περιγράφει σχέσεις, όχι τυχαία text files. Όρισε primary/foreign keys, χρησιμοποίησε παραμέτρους αντί να ενώνεις input σε query και τύλιξε σχετικές εγγραφές σε transaction. Στη SQLite ενεργοποίησε foreign-key enforcement ανά connection όταν το χρειάζεσαι.
```python
import sqlite3
with sqlite3.connect(":memory:") as db:
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("CREATE TABLE tasks(id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
    db.execute("INSERT INTO tasks(title) VALUES (?)", ("Review tools",))
    assert db.execute("SELECT title FROM tasks WHERE id=?", (1,)).fetchone()==("Review tools",)
```
Το `SELECT` χωρίς `ORDER BY` δεν υπόσχεται σειρά εμφάνισης. Index σε συχνά φίλτρα μπορεί να βοηθήσει αλλά επιβαρύνει writes/χώρο. Έλεγξε `EXPLAIN QUERY PLAN` με ρεαλιστικά δεδομένα.

**Άσκηση:** σχήμα tasks/comments με foreign key, δοκίμασε ορφανό comment, δείξε rollback στην αποτυχία. Πηγή: https://www.sqlite.org/lang.html.

## SQL_SQLite — Αναλυτικός οδηγός εξάσκησης

### Κανόνες δεδομένων
Το απόθεμα δεν επιτρέπεται να είναι αρνητικό, τα ονόματα είναι μοναδικά και μία ενημέρωση πρέπει να ολοκληρώνεται ή να ακυρώνεται προβλέψιμα. Χρησιμοποίησε in-memory βάση για να μη θιγεί πραγματικό project.

### Εκτέλεση
Αποθήκευσε stock.sql και τρέξε sqlite3 :memory: < stock.sql με εγκατεστημένο SQLite CLI. Τα δύο SELECT πρέπει να επιστρέψουν Pencil|7. Το δεύτερο αποδεικνύει ότι το ROLLBACK επανέφερε την ήδη αποθηκευμένη κατάσταση.

~~~sql
PRAGMA foreign_keys = ON;
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);
INSERT INTO items(name, stock) VALUES ('Pencil', 10);
BEGIN IMMEDIATE;
UPDATE items SET stock = stock - 3
WHERE name = 'Pencil' AND stock >= 3;
COMMIT;
SELECT name, stock FROM items;
BEGIN;
UPDATE items SET stock = 0 WHERE name = 'Pencil';
ROLLBACK;
SELECT name, stock FROM items;
EXPLAIN QUERY PLAN SELECT id FROM items WHERE name = 'Pencil';
~~~

### Τι εγγυάται το schema
Το CHECK (stock >= 0) αποκλείει αρνητικό τελικό απόθεμα. Το UNIQUE(name) δημιουργεί ήδη index, άρα άλλο ένα index στο ίδιο πεδίο είναι περιττό. Το BEGIN IMMEDIATE ζητά συναλλαγή εγγραφής εξαρχής και μπορεί να αποτύχει με SQLITE_BUSY αν γράφει άλλος. Το WHERE στο UPDATE αποφεύγει αφαίρεση από ανεπαρκές απόθεμα.

### Επέκταση εργαστηρίου
Τρέξε SELECT changes(); αμέσως μετά από UPDATE. Δοκίμασε ίδιο όνομα δύο φορές. Πρόσθεσε δεύτερο πίνακα με FOREIGN KEY και προσπάθησε να εισαγάγεις ανύπαρκτο id. Η ρύθμιση PRAGMA foreign_keys = ON πρέπει να εφαρμόζεται σε κάθε σύνδεση. Με EXPLAIN QUERY PLAN παρατήρησε τη χρήση του UNIQUE index.

### Ασφάλεια και σφάλματα
Σε πραγματικό κώδικα χρησιμοποίησε prepared statements και δεσμευμένες παραμέτρους για τιμές χρήστη. Τα σταθερά SQL literals είναι μόνο για το offline δείγμα. Σε database is locked βρες την άλλη σύνδεση και τη διάρκεια συναλλαγής πριν αυξήσεις timeout. Διαφορετικές SQL διάλεκτοι έχουν διαφορετική συμπεριφορά.
Επιτυχία: δύο τιμές 7 και εξέταση σχεδίου εκτέλεσης. https://www.sqlite.org/lang_transaction.html

## SQL_SQLite — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `sqlite3 :memory: < {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## SQL_SQLite — Διαδρομή ουσιαστικής εξάσκησης

### Στόχος και κριτήρια επιτυχίας
Κατασκεύασε μία βάση με εργασίες, ετικέτες και πίνακα συσχέτισης. Η σωστή εκτέλεση προσθέτει συνδεδεμένες εγγραφές, απορρίπτει ανύπαρκτη ετικέτα χωρίς να αφήνει μισοτελειωμένη καταχώριση, χρησιμοποιεί παραμέτρους σε ερωτήματα SQL και ελέγχει το σχέδιο αναζήτησης μέσω ευρετηρίου. Δεν χρειάζεται διακομιστής ή πρόσβαση στο διαδίκτυο. Η SQLite επιτρέπει παράλληλες αναγνώσεις, όμως ο χειρισμός ταυτόχρονων εγγραφών απαιτεί ξεχωριστή δοκιμή.

### Εκτελέσιμο εργαστήριο (Python 3.9+ με ενσωματωμένη sqlite3)
Αποθήκευσε τον κώδικα ως SqliteLab.py και εκτέλεσε python3 SqliteLab.py. Η βάση υπάρχει μόνο στη μνήμη και το PASS εμφανίζεται αφού επιβεβαιωθούν οι έλεγχοι.

~~~python
import sqlite3

with sqlite3.connect(':memory:') as db:
    db.execute('PRAGMA foreign_keys = ON')
    db.executescript('''
        CREATE TABLE task (id INTEGER PRIMARY KEY, title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 80));
        CREATE TABLE tag (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
        CREATE TABLE task_tag (task_id INTEGER REFERENCES task(id),
                               tag_id INTEGER REFERENCES tag(id),
                               PRIMARY KEY(task_id,tag_id));
    ''')
    with db:
        db.execute('INSERT INTO task VALUES (?,?)', (1, 'audit'))
        db.execute('INSERT INTO tag VALUES (?,?)', (10, 'urgent'))
        db.execute('INSERT INTO task_tag VALUES (?,?)', (1, 10))
    before = db.execute('SELECT count(*) FROM task').fetchone()[0]
    try:
        with db:
            db.execute('INSERT INTO task VALUES (?,?)', (2, 'temporary'))
            db.execute('INSERT INTO task_tag VALUES (?,?)', (2, 999))
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError('missing foreign-key rejection')
    assert db.execute('SELECT count(*) FROM task').fetchone()[0] == before
    assert db.execute('SELECT title FROM task WHERE id = ?', (1,)).fetchone() == ('audit',)
    db.execute('CREATE INDEX task_title_idx ON task(title)')
    plan = db.execute('EXPLAIN QUERY PLAN SELECT * FROM task WHERE title = ?', ('audit',)).fetchall()
    assert any('task_title_idx' in step[3] for step in plan), plan
    assert db.execute('PRAGMA foreign_keys').fetchone()[0] == 1
    print('PASS: rollback, FK, parameterization, indexed lookup')
~~~

### Ασκήσεις με σαφή όρια
1. Άλλαξε σε 999 την αναγνωριστική τιμή της έγκυρης ετικέτας στην *πρώτη* συναλλαγή. Πρόβλεψε ποιες εγγραφές θα αναιρεθούν και κατάγραψε το IntegrityError. Έπειτα επανάφερε τον κώδικα.
2. Αφαίρεσε προσωρινά το PRAGMA foreign_keys και έλεγξε αν γίνεται πλέον δεκτή η ανύπαρκτη συσχέτιση. Ενεργοποίησέ το ξανά: ο έλεγχος ξένων κλειδιών ισχύει ανά σύνδεση.
3. Πρόσθεσε δεύτερη φορά τη συσχέτιση (1,10) και επιβεβαίωσε ότι το σύνθετο πρωτεύον κλειδί τη σταματά. Δοκίμασε κενό τίτλο και τίτλο 81 χαρακτήρων για τον περιορισμό CHECK.
4. Επανάλαβε με προσωρινό αρχείο βάσης και δύο συνδέσεις. Πριν την οριστικοποίηση, η δεύτερη δεν πρέπει να βλέπει μη οριστικοποιημένες αλλαγές. Έλεγξε χωριστά σύγκρουση εγγραφών με χρονικό όριο αναμονής.

### Αντιμετώπιση προβλημάτων και απόδειξη
Αν περάσει μια ανύπαρκτη ετικέτα, εξέτασε το PRAGMA foreign_keys στην ίδια σύνδεση. Αν το σχέδιο δεν αναφέρει task_title_idx, έλεγξε πρώτα αν το ερώτημα κάνει ισότητα στη στήλη title· ο βελτιστοποιητής μπορεί να επιλέξει άλλο σχέδιο σε διαφορετικά δεδομένα. Για σφάλμα database is locked, βρες τη συναλλαγή που κρατά εγγραφή ανοικτή αντί να καταργήσεις τους περιορισμούς.

**Παραδοτέα:** έξοδος του προγράμματος, πλήθος εγγραφών πριν και μετά από επιτυχημένη και αποτυχημένη συναλλαγή, σχέδιο ερωτήματος και εξήγηση γιατί δεν συνθέτουμε SQL με κείμενο του χρήστη. Όλες οι δοκιμές χρησιμοποιούν τεχνητά δεδομένα.

## SQL SQLite — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Η SQLite υποστηρίζει συναλλαγές και παραμέτρους στις βιβλιοθήκες πρόσβασης.
2. Το NULL δεν συγκρίνεται όπως οι συνήθεις τιμές· χρησιμοποίησε IS NULL.
3. Τα ευρετήρια βελτιώνουν ορισμένες αναγνώσεις με κόστος εγγραφών· δες το σχέδιο ερωτήματος.
## Πρόσθετη τεχνική ανάλυση

Οι δοκιμές αντιγράφων χρειάζονται δομική ακεραιότητα και πραγματικά ερωτήματα εφαρμογής. Ένα αναγνώσιμο αρχείο με χαμένη επιχειρησιακή εγγραφή μπορεί να περάσει έλεγχο ακεραιότητας. Διατήρησε δοκιμές επαναφοράς χωριστά από τη ζωντανή βάση και επαλήθευσέ τες πριν χαρακτηρίσεις το αντίγραφο χρήσιμο.

[Ζωντανό αντίγραφο SQLite και ασκήσεις επαναφοράς](#read:fieldnotes-el-34)
