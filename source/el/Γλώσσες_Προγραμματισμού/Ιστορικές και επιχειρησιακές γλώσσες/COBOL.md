# cobol — συγκεντρωτικός οδηγός

## COBOL

**Συνήθης χρήση:** Ιστορικές και επιχειρησιακές γλώσσες.

**Προτεινόμενη επέκταση αρχείου:** `.cob`.

**Εκτέλεση / περιβάλλον:** cobc -x -free hello.cob && ./hello.

### Αρχικό παράδειγμα

```
identification division.
program-id. hello.
procedure division.
    display "Hello, Ada!".
    stop run.
```

### Πώς διαβάζεται

Η COBOL χρησιμοποιείται ακόμη σε επιχειρηματικά συστήματα.

### Συνηθισμένο λάθος

Η COBOL χρησιμοποιείται ακόμη σε επιχειρηματικά συστήματα. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## COBOL — Αναλυτικός οδηγός εξάσκησης

### Μικρή αφετηρία πηγαίου κώδικα
~~~text
identification division.
program-id. hello.
procedure division.
    display "Hello, Ada!".
    stop run.
~~~

**Περιβάλλον:** cobc -x -free hello.cob && ./hello.. Κράτησε αντίγραφο του αρχικού κώδικα και σημείωσε έκδοση εργαλείου. Ξεχώρισε αν η εκτέλεση επιστρέφει τιμή, εμφανίζει κείμενο ή αλλάζει state. Για τις πρώτες δοκιμές χρησιμοποίησε απομονωμένο περιβάλλον, όχι πραγματικούς λογαριασμούς ή δεδομένα.

### Ανάλυση του ιδιαίτερου μηχανισμού
Δημιούργησε fixed-width πελάτη με PIC fields, έλεγξε αριθμητικό ποσό και δημιούργησε report. Σύγκρινε edited PIC με stored numeric μορφή.

### Διάγνωση κρίσιμου ορίου
Column format, decimals και packed numeric fields διαφέρουν ανά compiler/format. Κράτα fixtures πριν τη μετατροπή.

## COBOL — Διαδρομή ουσιαστικής εξάσκησης

### Ειδικές προχωρημένες δοκιμές
Γράψε COBOL με σαφώς δηλωμένο fixed/free source format και PIC 9(5)V99 amount. Ξεχώρισε αποθηκευμένη τιμή από edited display.

Διάβασε τρία fixed-width records από προσωρινό αρχείο. Απόρριψε λάθος μήκος και μη αριθμητικό amount πριν το άθροισμα. Έλεγξε FILE STATUS.

Φτιάξε customer balance report με copybook. Δοκίμασε missing file, μηδενικό balance και μεγάλη τιμή και σύγκρινε decimal arithmetic με floats.
