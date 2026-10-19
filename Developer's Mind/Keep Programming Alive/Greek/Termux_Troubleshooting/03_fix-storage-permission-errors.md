# Σφάλματα αποθήκευσης Termux: άδειες Android, διαδρομές και noexec

## Γιατί συμβαίνει
Το ιδιωτικό $HOME του Termux δεν είναι ίδιο με το κοινόχρηστο storage του Android. Το termux-setup-storage ζητά άδεια και δημιουργεί συντομεύσεις, αλλά δεν μετατρέπει το /sdcard σε κανονικό filesystem για εκτέλεση. Περιορισμοί scoped storage, symlinks και noexec μπορεί να εμποδίζουν scripts. Κράτα repositories και εκτελέσιμα στο $HOME και μετέφερε μόνο αρχεία εισόδου/εξόδου.

## Ελεγχόμενες εντολές διάγνωσης

~~~sh
printf 'HOME=%s\n' "$HOME"
ls -ld "$HOME" "$HOME/storage" 2>/dev/null
termux-setup-storage
ls -ld "$HOME/storage/shared" 2>/dev/null
# Prefer:
mkdir -p "$HOME/projects"
# Run projects from $HOME, not directly from /sdcard.
~~~

## Ασφαλής πορεία διόρθωσης
Σε Permission denied δες πρώτα τις άδειες εφαρμογής Android και ξανατρέξε termux-setup-storage όταν έχει δοθεί η άδεια. Έλεγξε την πραγματική διαδρομή με pwd -P και ls -ld· το αρχείο μπορεί απλώς να λείπει. Αν script βρίσκεται σε shared storage και δεν εκτελείται, αντέγραψέ το στο $HOME και όρισε δικαιώματα εκεί. Απόφυγε chmod 777 και αποθήκευση secrets σε κοινόχρηστους φακέλους.

## Πρακτικό εργαστήριο
Φτιάξε ακίνδυνο hello.sh στο $HOME και τρέξ' το με sh hello.sh. Αντέγραψέ το σε shared storage και σύγκρινε άμεση εκτέλεση και ερμηνεία μέσω sh στη δική σου έκδοση Android. Κατέγραψε διαδρομή, errno και permissions χωρίς καθολικές αλλαγές Android.
