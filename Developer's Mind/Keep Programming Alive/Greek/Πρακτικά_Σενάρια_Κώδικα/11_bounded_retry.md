# Πρακτικά scripts: retries, caching και διαδρομές γράφων

## 11. Επανάληψη προσωρινής αποτυχίας

### Η σύμβαση
Το 11_bounded_retry.py επαναλαμβάνει μόνο TimeoutError, με σταθερό max_attempts. ValueError και άλλα μόνιμα errors προωθούνται αμέσως. Η παράμετρος ελέγχεται με ακριβή τύπο int ώστε max_attempts=True να απορρίπτεται. Το pause callback του caller λαμβάνει τον αριθμό αποτυχημένης προσπάθειας πριν από το επόμενο retry.

### Προσομοίωση χωρίς δίκτυο
Τρέξε python 11_bounded_retry.py. Η ενέργεια αποτυγχάνει δύο φορές και επιτυγχάνει στην τρίτη. Το test απαιτεί ακριβώς τρεις κλήσεις και callback με [1,2]. Ελέγχεται επίσης ότι ValueError δεν κρύβεται και boolean limit απορρίπτεται. Αναμενόμενο: retry budgets and exception boundaries passed.

### Χρονισμός και side effects
Το default pause δεν καθυστερεί σκόπιμα, για να είναι το εργαστήριο γρήγορο και deterministic. Σε πραγματικά δίκτυα βάλε bounded exponential backoff με jitter και μέγιστη συνολική διάρκεια. Κάνε retry μόνο σε idempotent ενέργειες ή με idempotency key: ένα timeout μπορεί να έρθει αφού ο server έχει ολοκληρώσει εγγραφή ή πληρωμή.

### Επέκταση
Φτιάξε action που πετά TimeoutError πάντα και επιβεβαίωσε ότι σταματά στο max_attempts και επαναφέρει την τελική εξαίρεση. Πρόσθεσε deadline με injectable clock ώστε να δοκιμάζεις χρόνο χωρίς sleep. Μην εμφανίζεις ευαίσθητα request bodies σε logs. Κώδικας: 11_bounded_retry.py. Πηγή: https://docs.python.org/3/library/exceptions.html#TimeoutError

## 12. Προσωρινή αποθήκευση καθαρής συνάρτησης

### Πότε επιτρέπεται cache
Το 12_memoization.py υπολογίζει Fibonacci με functools.lru_cache(maxsize=128). Η έξοδος εξαρτάται μόνο από integer n, άρα η αποθήκευση αποτελέσματος δεν αλλάζει τη λογική. Η απλή αναδρομή ξαναυπολογίζει υποπροβλήματα, ενώ η cache τα επαναχρησιμοποιεί. Ο κώδικας απορρίπτει bool, floats, αρνητικούς και n πάνω από 200 ώστε ο περιορισμός να είναι σαφής.

### Εκτέλεση και παρατήρηση
Τρέξε python 12_memoization.py. Αδειάζει την cache, ελέγχει fibonacci(10)==55, επαναλαμβάνει την κλήση και επιβεβαιώνει ότι cache_info().hits αυξάνεται κατά ένα. Ελέγχει επίσης 0, 1 και άκυρες εισόδους. Αναμενόμενο: memoization correctness and cache-hit checks passed. Το cache_info() δείχνει hits, misses, τρέχον και μέγιστο μέγεθος, όχι απλή διαφήμιση ταχύτητας.

### Περιορισμοί
Η lru_cache χρησιμοποιεί arguments ως keys και μπορεί να διατηρεί references μέχρι eviction. Μην κάνεις cache function που εξαρτάται από χρόνο, network state, mutable globals ή user permissions χωρίς ειδική invalidation. Το όριο 128 σημαίνει ότι παλιές τιμές μπορεί να απομακρυνθούν από την cache.

### Επέκταση
Σύγκρινε repeated calls με iterative Fibonacci χωρίς cache. Μέτρησε χωριστά correctness και execution time σε κατάλληλες μικρές τιμές. Εξήγησε γιατί η αφελής αναδρομή έχει πολλά επαναλαμβανόμενα βήματα. Χρησιμοποίησε cache_clear σε προγραμματισμένη invalidation. Μη θεωρείς ασφαλή caching από mutable εξωτερικά objects. Κώδικας: 12_memoization.py. Πηγή: https://docs.python.org/3/library/functools.html#functools.lru_cache

## 13. Διάσχιση γράφου με ουρά

### Στόχος

Το σύνολο επισκέψεων εμποδίζει ατέρμονη επανάληψη σε κύκλους.

### Αρχείο κώδικα

`13_queue_bfs.py`

### Βήματα

1. Διάβασε τη συνάρτηση και πρόβλεψε το αποτέλεσμα.
2. Τρέξε το αρχείο μόνο μέσα σε φάκελο εξάσκησης: `python 13_queue_bfs.py`.
3. Άλλαξε ένα δεδομένο και πρόσθεσε δική σου δοκιμή `assert`.
4. Δοκίμασε λανθασμένη είσοδο και σημείωσε τη συμπεριφορά.
5. Σκέψου τι απαιτείται πριν το βάλεις σε πραγματικό πρόγραμμα.

### Λύση / βάση αναφοράς

Το αρχείο `13_queue_bfs.py` περιέχει την πλήρη υλοποίηση και τις αρχικές δοκιμές.
