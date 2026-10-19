# Σφάλματα CRLF και shebang: εξέτασε τα πραγματικά bytes

## Αιτία και συμπτώματα
Ένα shell script που γράφτηκε σε Windows ίσως έχει CRLF. Σε Linux/Termux το carriage return μπορεί να συμπεριληφθεί στη διαδρομή του shebang και να προκαλέσει bad interpreter, παρότι το κείμενο φαίνεται σωστό. Διαφορετικές αιτίες είναι απουσία shebang, λανθασμένη διαδρομή interpreter ή έλλειψη execute bit. Πριν από μαζική διόρθωση έλεγξε bytes.

## Αναπαραγωγή / διαγνωστικές εντολές
Εκτέλεσε σε δικό σου δοκιμαστικό περιβάλλον και έλεγξε τις διαδρομές πριν αλλάξεις αρχεία.
~~~sh
# Read the first bytes of an affected script:
od -An -tx1 -N64 ./script.sh
# On a DISPOSABLE copy, normalize CRLF to LF using Python:
python -c 'from pathlib import Path; p=Path("script.sh"); p.write_bytes(p.read_bytes().replace(b"\r\n",b"\n"))'
# Verify the actual interpreter path with command -v sh.
~~~

## Επίλυση με βάση τα στοιχεία
Κράτησε backup πριν από τη μετατροπή, ειδικά αν υπάρχουν binary δεδομένα ή συνειδητό CRLF. Άλλαξε μόνο αποδεδειγμένα text files με σωστό encoding. Χρησιμοποίησε /usr/bin/env sh μόνο όπου υπάρχει ή την επιβεβαιωμένη διαδρομή sh του Termux. Το sh script.sh μπορεί να λειτουργεί παρακάμπτοντας το shebang και βοηθά τη διάγνωση, αλλά δεν διορθώνει τη direct execution.

## Πρακτικό εργαστήριο
Φτιάξε δύο ίδια scripts με LF και CRLF. Έλεγξε την πρώτη γραμμή σε hex, σύγκρινε sh file και ./file μετά από chmod u+x, μετέτρεψε μόνο το δοκιμαστικό αντίγραφο και επανέλαβε.
