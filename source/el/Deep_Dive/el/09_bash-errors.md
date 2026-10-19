# Αμυντικά Bash scripts και exit codes

## Τι συμβαίνει
Στο Bash κωδικός 0 σημαίνει επιτυχία. Μια αποτυχημένη εντολή μέσα σε pipeline μπορεί να μην εντοπιστεί χωρίς ρητό χειρισμό.

## Πρακτικός έλεγχος
Βάλε εισαγωγικά σε μεταβλητές paths, ξεχώρισε ανύπαρκτες από κενές μεταβλητές και χρησιμοποίησε προσωρινά αρχεία με cleanup traps.

## Συνήθεις παγίδες
Μην εκτελείς απευθείας απομακρυσμένο curl output. Κατέβασε από έμπιστη πηγή, διάβασε τον κώδικα, έλεγξε υπογεγραμμένη έκδοση και μετά τρέξε.

## Μικρό παράδειγμα για προσαρμογή
```text
bash -n ./script.sh
```

## Κράτησε το failure status πριν το αλλάξει άλλη εντολή
~~~bash
if grep -q 'needle' ./fixture.txt; then
  printf '%s\n' 'found'
else
  status=$?
  if [ "$status" -eq 1 ]; then
    printf '%s\n' 'not found'
  else
    printf 'read/search failed: %s\n' "$status" >&2
    exit "$status"
  fi
fi
~~~
Φτιάξε fixture με needle, ένα χωρίς τη λέξη και μία περίπτωση missing path. Το grep status 1 σημαίνει no match και διαφέρει από error. Αν καταγράψεις `$?` μετά από logging command, παίρνεις status του logger. Το `if command` επομένως είναι συχνά σαφέστερο από τυφλή εξάρτηση στο set -e.

Το `bash -n` ελέγχει σύνταξη, όχι ύπαρξη αρχείων, σωστό quoting πραγματικών δεδομένων ή επιτυχία εντολών. Πρόσθεσε fixtures με whitespace και αρχική παύλα. Cleanup trap πρέπει να αφαιρεί μόνο το temporary path αυτής της εκτέλεσης, ακόμη και σε interrupt, χωρίς κενή ή ανεπιβεβαίωτη μεταβλητή ως στόχο διαγραφής.
