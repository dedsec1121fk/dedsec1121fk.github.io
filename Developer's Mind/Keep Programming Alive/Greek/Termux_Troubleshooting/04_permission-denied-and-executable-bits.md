# Permission denied: interpreter, execute bit και Android filesystem

## Αιτία και συμπτώματα
Μια εντολή μπορεί να επιστρέψει Permission denied αν λείπει το execute bit, δεν έχεις δικαίωμα διάσχισης γονικού φακέλου, ο interpreter του shebang δεν υπάρχει ή το filesystem εμποδίζει άμεση εκτέλεση. Στο Termux το ιδιωτικό $HOME διαφέρει από Android shared storage. Το chmod δεν παρακάμπτει noexec filesystem.

## Αναπαραγωγή / διαγνωστικές εντολές
Εκτέλεσε σε δικό σου δοκιμαστικό περιβάλλον και έλεγξε τις διαδρομές πριν αλλάξεις αρχεία.
~~~sh
mkdir -p "$HOME/termux-exec-lab"
cd "$HOME/termux-exec-lab"
printf '#!/data/data/com.termux/files/usr/bin/sh\nprintf "worked\\n"\n' > hello.sh
ls -l hello.sh
sh hello.sh
chmod u+x hello.sh
./hello.sh
# For a portable interpreter path, inspect: command -v sh
~~~

## Επίλυση με βάση τα στοιχεία
Έλεγξε το ακριβές σφάλμα με ls -l, ls -ld σε γονικούς καταλόγους και command -v για τον interpreter. Προτίμησε εκτελέσιμα scripts μέσα στο $HOME. Αν το αρχείο είναι σε shared storage, χρησιμοποίησε ρητό interpreter ή αντέγραψέ το σε κατάλληλο κατάλογο. Ακόμη και με +x μπορεί να αποτύχει shebang λόγω CRLF. Μην κάνεις chmod 777 αναδρομικά.

## Πρακτικό εργαστήριο
Φτιάξε ένα αρχείο χωρίς execute bit και άλλο με λανθασμένο shebang. Σύγκρινε ./script με sh script και κατέγραψε διαφορετικά σφάλματα. Κάνε τις δοκιμές μόνο σε αναλώσιμο φάκελο και μην αλλάξεις δικαιώματα πραγματικών projects.

## Επαλήθευση
Κατέγραψε περιβάλλον, ακριβή αποτυχία, αλλαγή και regression result. Μην παρουσιάζεις γενικές συμβουλές ως δοκιμασμένη λύση χωρίς επανέλεγχο.
