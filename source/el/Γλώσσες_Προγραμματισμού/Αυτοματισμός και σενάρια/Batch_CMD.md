# batch_cmd — συγκεντρωτικός οδηγός

## Batch CMD

### Μοντέλο λειτουργίας
Τα batch αρχεία των Windows CMD χρησιμοποιούν percent expansion με διαφορετικούς κανόνες από Bash και PowerShell.

### Παράδειγμα
```text
@echo off
set /a total=2+3
echo %total%
```

### Δοκίμασέ το με νόημα
Τρέξε σε Windows CMD και σύγκρινε variable expansion μέσα σε parenthesized block και έξω από αυτό.

### Σφάλμα που πρέπει να ξεχωρίσεις
Το percent substitution μέσα σε block γίνεται κατά το parsing· το delayed expansion χρειάζεται σωστή ενεργοποίηση.

Για να κρίνεις την άσκηση, κατέγραψε την αρχική είσοδο, την πρόβλεψη και την παρατήρηση σε πραγματικό, συμβατό περιβάλλον Batch_CMD. Δώσε ξεχωριστό παράδειγμα όπου αλλάζει μόνο μία μεταβλητή ή ένα όρισμα. Αν εργάζεσαι χωρίς την αναγκαία εφαρμογή, μελέτησε τη σύνταξη ως παράδειγμα και μην παρουσιάζεις το κείμενο ως εκτελεσμένο test.

## Batch_CMD — Αναλυτικός οδηγός εξάσκησης

### Πραγματικό αρχικό δείγμα
~~~text
@echo off
set "NAME=Ada"
echo Hello, %NAME%!
~~~

**Περιβάλλον:** cmd /c hello.bat on Windows.. Επιβεβαίωσε ότι έχεις το σωστό compiler, host ή simulator πριν θεωρήσεις την έξοδο αξιόπιστη. Για scripts με πρόσβαση σε προσωπικά αρχεία ή ρυθμίσεις, χρησιμοποίησε προσωρινά και read-only δεδομένα.

### Συγκεκριμένος στόχος υλοποίησης
Φτιάξε read-only CMD script με if exist και εμφάνιση quoted argument. Δοκίμασε κενά, παρενθέσεις και delayed expansion σε FOR block.

### Κρίσιμο λάθος που πρέπει να αναγνωρίζεις
Το percent expansion γίνεται κατά το parse ενός block· το !var! έχει παγίδες με filenames που περιέχουν !.

## Batch_CMD — Διαδρομή ουσιαστικής εξάσκησης

### Θεμελιώδης άσκηση
Φτιάξε Windows CMD batch που δέχεται quoted path και ελέγχει IF EXIST χωρίς να αλλάζει αρχεία.

### Άσκηση επίλυσης προβλήματος
Σε FOR loop μελέτησε percent expansion μέσα σε παρενθέσεις. Σύγκρινε delayed expansion και δοκίμασε όνομα με θαυμαστικό.

### Ανεξάρτητο έργο
Γράψε inventory batch με σαφή ERRORLEVEL. Δοκίμασε paths με spaces, parentheses και Unicode σύμφωνα με διαθέσιμο code page.
