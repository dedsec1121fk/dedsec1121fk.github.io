# Πρακτικά scripts: JSONL, SHA-256 και ασφαλή paths

## 04. Φιλτράρισμα γραμμών JSON

### Μία JSON τιμή ανά φυσική γραμμή
Το 04_jsonl_filter.py παίρνει iterable γραμμών και κάνει decode σε καθεμία ανεξάρτητα. Κάθε τιμή πρέπει να είναι object με integer level. Τα booleans απορρίπτονται παρά τη σχέση bool/int στην Python. Levels μικρότερα από min_level είναι έγκυρα αλλά φιλτραρισμένα, όχι errors.

### Ερμηνεία αποτελέσματος
Τρέξε python 04_jsonl_filter.py. Οι τιμές εισόδου είναι level 1, level 3, άκυρο κείμενο, boolean true, level 2 και κενή γραμμή. Για threshold 2, οι αποδεκτές είναι [3,2] και τα errors [3,4,6]. Η συνάρτηση δοκιμάζεται επίσης με generator και απορρίπτει min_level=True. Το JSONL δεν είναι ένας JSON array.

### Ανεξάρτητη άσκηση
Άνοιξε local αρχείο με encoding="utf-8" και δώσε το file handle απευθείας ως iterator. Πρόσθεσε μέγιστο μήκος γραμμής πριν από json.loads για μη έμπιστο αρχείο. Αποφάσισε αν blank lines πρέπει να αγνοούνται ή να καταγράφονται: εδώ καταγράφονται. Πρόσθεσε χωριστό πλήθος valid-but-filtered εγγραφών.

### Περιορισμός μνήμης
Η είσοδος μπορεί να διαβάζεται σταδιακά, αλλά accepted rows και error positions αποθηκεύονται σε lists. Σε μεγάλα logs χρειάζεται generator εξόδου και bounded error sink. Κώδικας: 04_jsonl_filter.py. Προδιαγραφή: https://jsonlines.org/

## 05. SHA-256 για ακεραιότητα

### Δύο διαφορετικές λειτουργίες
Η sha256_bytes(data) υπολογίζει digest από ήδη φορτωμένα bytes. Η sha256_file(path) διαβάζει το αρχείο σε chunks 65.536 bytes εξ ορισμού, χωρίς να φορτώνει τεράστιο αρχείο στη μνήμη. Απορρίπτει μηδενικό, αρνητικό και boolean chunk_size. Επιστρέφει lowercase hex digest.

### Δοκιμαστική γνωστή τιμή
Τρέξε python 05_sha256_memory.py. Το SHA-256 του abc πρέπει να είναι ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad. Το test γράφει αρχείο σε προσωρινό directory, το διαβάζει με chunks ενός byte, αλλάζει ένα byte και ελέγχει διαφορά hash. Καλύπτει και κενό input χωρίς εξωτερικά πακέτα.

### Digest δεν σημαίνει γνησιότητα
Ένα hash αποδεικνύει ισότητα σε σχέση με έμπιστη αναφορά. Ένας attacker μπορεί να δημοσιεύσει κακόβουλο αρχείο μαζί με το δικό του σωστό hash. Για releases χρειάζονται αξιόπιστα metadata ή υπογραφή από authenticated πηγή. Matching hash από την ίδια αναξιόπιστη σελίδα δεν αποδεικνύει publisher identity.

### Επέκταση
Σύγκρινε chunked hash με hashlib.sha256(Path(...).read_bytes()) σε μικρό fixture και μέτρησε μνήμη σε μεγαλύτερο συνθετικό αρχείο. Το αρχείο μπορεί να αλλάξει κατά την ανάγνωση και τα symlinks οδηγούν σε άλλες θέσεις· το hashing δεν είναι sandbox. Πηγή: https://docs.python.org/3/library/hashlib.html

## 06. Έλεγχος διαδρομής στον χώρο εργασίας

### Τι ελέγχει πραγματικά η allowed()
Το 06_path_containment.py κάνει strict resolve στον υπάρχοντα root. Τα relative candidate paths ερμηνεύονται ως σχετικά με τον root, τα absolute διατηρούνται absolute, και ο έλεγχος γίνεται στα πραγματικά Path parent components. Έτσι απορρίπτεται sibling με όνομα workspace-extra που θα περνούσε από απλό string startswith.

### Ασφαλή tests
Τρέξε python 06_path_containment.py. Δημιουργεί προσωρινό workspace και δοκιμάζει υπαρκτό αρχείο, σχετική διαδρομή, parent traversal, παρόμοιο sibling και (αν το OS επιτρέπει) symlink προς έξω. Αναμενόμενη έξοδος: resolved containment checks passed (not race-free).

### Κρίσιμο όριο ασφαλείας
Το αποτέλεσμα ισχύει για τη συγκεκριμένη στιγμή. Αν attacker μπορεί να αλλάξει symlink μεταξύ resolve() και open(), η αρχικά έγκυρη διαδρομή μπορεί να οδηγεί αλλού. Αυτό είναι time-of-check/time-of-use race: η allowed() δεν αποτελεί μοναδικό μέτρο προστασίας. Για εχθρικό filesystem χρειάζονται directory-relative opens, no-follow πολιτική και έλεγχος του ανοιγμένου file descriptor.

### Άσκηση
Σύγκρινε allowed(root, Path("hello.txt")) με allowed(root, Path("../escape.txt")). Βεβαιώσου ότι αν λείπει ο root παίρνεις exception λόγω strict=True. Δημιούργησε symlink προς εξωτερικό αρχείο και έλεγξε απόρριψη. Κώδικας: 06_path_containment.py. Πηγή: https://docs.python.org/3/library/pathlib.html
