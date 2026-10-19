# Διάγνωση storage με errno και πραγματικό filesystem

## Χώρος, quota και read-only είναι διαφορετικές αιτίες
Η αποτυχία δημιουργίας αρχείου δεν αποδεικνύει γεμάτο δίσκο. Το ENOSPC αφορά διαθέσιμο χώρο ή metadata capacity, το EDQUOT όριο quota, ενώ το EROFS εγγραφή σε filesystem μόνο για ανάγνωση. Το EACCES αφορά δικαιώματα πρόσβασης. Ένα read-only mount μπορεί να έχει πολλά ελεύθερα blocks. Κράτησε πρώτα την ακριβή εξαίρεση.

## Μέτρησε τον πραγματικό προορισμό
~~~sh
df -h .
df -i .
findmnt -T . -o TARGET,FSTYPE,OPTIONS
du -h -d 1 .
~~~
Αντικατάστησε το `.` με τον φάκελο όπου γράφει η εφαρμογή. Ο προσωρινός κατάλογος συσκευασίας και ο τελικός προορισμός ZIP μπορεί να είναι διαφορετικά mounts. Το `df -i` βοηθά μόνο όταν το filesystem εκθέτει χρήσιμη μέτρηση inodes. Το `findmnt` είναι εργαλείο Linux· η απουσία του στο Android δεν αποδεικνύει κατάσταση του δίσκου.

## Ελεγχόμενη δοκιμή λίγων bytes
Τρέξε το παρακάτω σε φάκελο που ελέγχεις. Δημιουργεί και αφαιρεί μόνο ένα προσωρινό αρχείο, χωρίς καθαρισμό άλλων δεδομένων.
~~~python
from pathlib import Path
from tempfile import NamedTemporaryFile
import errno

target = Path('.')
try:
    with NamedTemporaryFile(dir=target, prefix='storage-probe-') as probe:
        probe.write(b'ok\n')
        probe.flush()
        print('write probe succeeded')
except OSError as exc:
    print(errno.errorcode.get(exc.errno, 'UNKNOWN'), exc.filename)
~~~
Η επιτυχία αποδεικνύει μόνο ότι αυτή η μικρή πράξη δούλεψε τώρα. Δεν εγγυάται χώρο για ολόκληρο build ούτε αντοχή buffered δεδομένων σε διακοπή ρεύματος. Μετά τη συγκεκριμένη διόρθωση επανάλαβε την αρχική αποτυχημένη εργασία.

## Γιατί διαφωνούν du και df
Το `du` μετρά όσα αρχεία μπορεί να διασχίσει, ενώ το `df` εμφανίζει λογιστική του filesystem. Διαγραμμένο αρχείο που παραμένει ανοιχτό από διεργασία μπορεί να δεσμεύει χώρο μέχρι να κλείσει ο τελευταίος descriptor. Snapshots, reserved blocks και container layers επίσης αλλάζουν τα αποτελέσματα. Μην αγνοείς Permission denied στο `du`: το άθροισμα είναι τότε ελλιπές.

## Επίλεξε επισκευή βάσει αιτίας
Για blocks εντόπισε αναδημιουργήσιμα αποτελέσματα και υπολόγισε απαιτούμενο περιθώριο. Για inodes αναζήτησε υπερβολικά πολλά μικρά generated αρχεία. Σε EROFS μετά από storage errors προέχει αντίγραφο δεδομένων και διερεύνηση με τον διαχειριστή, όχι τυφλό remount read-write. Σε quota, ελεύθερος χώρος άλλου χρήστη δεν αυξάνει αυτόματα το δικό σου όριο.

Πηγή: [Linux file-opening errors](https://man7.org/linux/man-pages/man2/open.2.html).
## Ανοιχτά αποσυνδεδεμένα αρχεία και διαφορά df/du

Η αφαίρεση εγγραφής καταλόγου δεν απελευθερώνει πάντα αμέσως bytes. Ανοιχτός descriptor μπορεί να κρατήσει αποσυνδεδεμένο αρχείο ώσπου να κλείσουν οι σχετικές αναφορές. Η συνολική χρήση συστήματος αρχείων μπορεί έτσι να μετρά χώρο που δεν βρίσκει η διάσχιση ονομάτων.

Εντόπισε τον ιδιοκτήτη του handle πριν επανεκκίνηση. Μην περικόπτεις descriptor άγνωστης υπηρεσίας μόνο για να μικρύνει ένας αριθμός. Το δείγμα Linux χρησιμοποιεί προσωρινό αρχείο και αποδεικνύει ανάγνωση από ανοιχτό handle μετά το unlink.

```python
import os, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as folder:
    path=Path(folder)/"open.txt"
    path.write_bytes(b"still referenced")
    with path.open("rb") as stream:
        path.unlink()
        assert not path.exists()
        assert stream.read() == b"still referenced"
print("open handle retains data")
```

Εκτέλεσε σε Linux ή ιδιωτικό σύστημα αρχείων Termux· οι κανόνες διαγραφής Windows διαφέρουν. Το μικρό δείγμα δεν μετρά επιστροφή blocks. Σε συμβάν σύγκρινε προσαρτήσεις, άδειες και ανοιχτά αρχεία πριν θεωρήσεις χαλασμένη τη λογιστική χώρου.

[Τεχνική αναφορά](https://pubs.opengroup.org/onlinepubs/9799919799/functions/unlink.html)
