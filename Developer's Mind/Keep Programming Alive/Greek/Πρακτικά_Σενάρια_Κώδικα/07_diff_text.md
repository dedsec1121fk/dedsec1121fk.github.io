# Πρακτικά scripts: διαφορές εκδόσεων, logs και SQLite

## 07. Σύγκριση εκδόσεων κειμένου

### Τρόπος λειτουργίας
Η changed(old,new,context=3) στο 07_diff_text.py χρησιμοποιεί difflib.unified_diff. Παίρνει δύο strings και με splitlines(keepends=True) διατηρεί τα line terminators. Το unified diff εμφανίζει αφαιρεμένες γραμμές με μείον και νέες με συν, διατηρώντας context πριν/μετά.

### Έλεγχος
Τρέξε python 07_diff_text.py. Ελέγχει αντικατάσταση two σε three, ίδιο κείμενο χωρίς diff, προσθήκη ελληνικής γραμμής και μηδενικό context. Το boolean context απορρίπτεται παρότι στην Python το bool είναι subclass του int. Αναμενόμενο: unified diff checks passed.

### Εργαστήριο σημασιολογίας
Δημιούργησε δύο εκδόσεις αρχείου ρυθμίσεων. Άλλαξε μόνο κενά, έπειτα όνομα variable και τέλος αριθμητικό threshold. Το line diff δείχνει γραμμές αλλά δεν αποδεικνύει αν άλλαξε η συμπεριφορά. Για κώδικα χρειάζονται και tests. Έλεγξε αρχεία χωρίς τελικό newline και πώς εμφανίζονται οι αλλαγές.

### Περιορισμοί
Η συνάρτηση δεν εφαρμόζει patches, δεν συγκρίνει binary files και δεν είναι three-way merge. Δεν εγγυάται απόλυτη συμβατότητα Git patches σε κάθε ασυνήθιστη περίπτωση. Μετέτρεψε bytes με κατάλληλο encoding πριν συγκρίνεις. Κώδικας: 07_diff_text.py. Πηγή: https://docs.python.org/3/library/difflib.html

## 09. Ανάλυση δομημένων συμβάντων καταγραφής

### Σαφές schema
Το 09_log_events.py διαβάζει JSON μία φυσική γραμμή κάθε φορά. Κάθε έγκυρο event απαιτεί severity INFO/WARN/ERROR, ISO 8601 timestamp με timezone και string message. Επιστρέφει αριθμό γραμμής, normalized timestamp, severity και message κομμένο στους 120 χαρακτήρες. Άλλα πεδία όπως token δεν προωθούνται.

### Τρέξε τα tests
Εκτέλεσε python 09_log_events.py. Το fixture περιέχει έγκυρο UTC event, event χωρίς timezone και μη έγκυρο JSON. Οι δύο τελευταίες γραμμές γίνονται generic invalid log line. Το test ελέγχει ότι το επιπλέον πεδίο token απουσιάζει. Αναμενόμενο: log event validation checks passed.

### Προειδοποίηση ιδιωτικότητας
Ο parser δεν αναγνωρίζει αυτόματα passwords ή προσωπικά δεδομένα μέσα στο message. Το truncation δεν είναι redaction. Χρησιμοποίησε μη ευαίσθητα messages ή καθάρισε τα δεδομένα στον producer. Σε production χρειάζονται access controls, retention policy, bounded buffers και monitoring parsing failures.

### Εργαστήριο χρονικής σειράς
Δώσε δύο έγκυρα events εκτός χρονικής σειράς και σύγκρινε line numbers με timestamps: arrival order και event-time order διαφέρουν. Πρόσθεσε δοκιμή με +03:00 και με αδύνατη ημερομηνία. Τα error messages δεν πρέπει να διαρρέουν το αρχικό περιεχόμενο. Κώδικας: 09_log_events.py. Πηγή: https://docs.python.org/3/library/datetime.html

## 10. Εργασίες SQLite με συναλλαγές

### Τι εκτελεί το εργαστήριο
Το 10_sqlite_tasks.py φτιάχνει προσωρινή SQLite database σε δίσκο, με NOT NULL, UNIQUE και CHECK. Εισάγει τίτλο με απόστροφο μέσω SQL bound parameter και ενημερώνει την εγγραφή σε transaction. Έπειτα αρχίζει άλλη συναλλαγή όπου ο κανόνας CHECK(done IN (0,1)) αποτυγχάνει. Το rollback πρέπει να ακυρώνει τόσο το άκυρο row όσο και το προηγούμενο Temporary insert της ίδιας συναλλαγής.

### Επανέλεγχος μετά το κλείσιμο
Τρέξε python 10_sqlite_tasks.py. Περιμένουμε ακριβώς ένα αποθηκευμένο task, Learner's task με done=1. Το script κλείνει και ανοίγει ξανά τη βάση και επιβεβαιώνει ότι το committed row παραμένει και το Temporary απουσιάζει. Χρησιμοποιεί TemporaryDirectory, όχι πραγματικές βάσεις χρήστη. Αναμενόμενο μήνυμα: SQLite transaction and rollback checks passed.

### Κρίσιμα σημεία
Το connection context manager κάνει commit ή rollback αλλά δεν κλείνει αναγκαστικά τη σύνδεση· γι' αυτό χρησιμοποιείται closing. Οι SQL parameters αναπαριστούν τιμές και όχι SQL syntax. Δεν μπορούν να αντικαταστήσουν table names. Το CHECK προστατεύει δεδομένα στο DB layer αλλά δεν καταργεί την ανάγκη UI validation.

### Επέκταση
Πρόσθεσε δεύτερο task και delete, προκάλεσε failure πριν commit και έλεγξε ότι ακυρώθηκαν όλα. Δημιούργησε migration για due_date σε χωριστή δοκιμαστική βάση. Μελέτησε SQLITE_BUSY χωρίς απενεργοποίηση constraints. Κώδικας: 10_sqlite_tasks.py. Πηγή: https://docs.python.org/3/library/sqlite3.html
