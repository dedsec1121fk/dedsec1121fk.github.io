# Μεταβλητές περιβάλλοντος και ρυθμίσεις σε πολλές πλατφόρμες

## Μεταβλητές περιβάλλοντος και μυστικά

### Πρακτική εξήγηση
Environment variables μεταφέρουν configuration σε processes, αλλά δεν είναι secret vault. Μπορούν να διαρρεύσουν μέσω logs, crash reports, child processes ή debugging.

### Παράδειγμα
~~~python
import os
port=int(os.environ.get('APP_PORT','8000'))
assert 0<port<65536
~~~

### Πραγματική άσκηση
Χρησιμοποίησε harmless port variable και απόρριψε άκυρα strings. Δες ποια child processes την κληρονομούν· μη τυπώνεις tokens.

### Έλεγχος συμβολαίου
Για Environment variables and secrets εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Ανάπτυξη σε πολλές πλατφόρμες

### Πρακτική εξήγηση
Portable code χειρίζεται ρητά path separators, line endings, process APIs, filesystem και permissions. Το ότι τρέχει σε Linux δεν εγγυάται Windows/Termux.

### Παράδειγμα
~~~python
from pathlib import Path
p=Path('docs')/'guide.md'
assert p.name=='guide.md'
~~~

### Πραγματική άσκηση
Δοκίμασε path με κενά και ελληνικά στα target platforms. Έλεγξε permissions και executable availability αντί για hardcoded /bin/bash.

### Έλεγχος συμβολαίου
Για Cross platform development εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

### Πρακτικός έλεγχος ορίων

Η μεταβλητή περιβάλλοντος δεν είναι κρυπτογραφημένο θησαυροφυλάκιο. Όταν δίνεις τιμή σε παιδική διεργασία, μπορεί να την κληρονομήσει. Μη γράφεις μυστικά σε logs, αναφορές σφαλμάτων ή snapshots του περιβάλλοντος. Σε κοινόχρηστο υπολογιστή χρησιμοποίησε τα δικαιώματα χρήστη και τον κατάλληλο μηχανισμό φύλαξης κλειδιών της πλατφόρμας. Εξέτασε επίσης ποιον φάκελο θεωρεί το πρόγραμμα αρχικό και πού μπορεί να γράψει προσωρινά αρχεία. Μια ρύθμιση που λειτουργεί μόνο σε Linux δεν είναι αυτονόητα συμβατή με Android ή Windows.
