# Παραδείγματα σφαλμάτων: Python και JavaScript

## Python: μεταβαλλόμενη προεπιλεγμένη παράμετρος

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
def add(item, items=[]):
    items.append(item)
    return items
```

### Διορθωμένο παράδειγμα

```text
def add(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Μια προεπιλεγμένη λίστα δημιουργείται μία φορά και χρησιμοποιείται από όλες τις κλήσεις.

Έλεγξε imports, υπογραφή συνάρτησης και περιβάλλον: τα τμήματα μπορεί να χρειάζονται ενσωμάτωση πριν εκτελεστούν.

### Πραγματική αιτία
Μια λίστα ως default δημιουργείται κατά το function definition και μοιράζεται σε ξεχωριστές κλήσεις χωρίς argument. Η fixed function δημιουργεί νέα λίστα εκτός αν caller δώσει ρητά collection.

### Επαναλήψιμο regression πείραμα
Κάλεσε broken function με 'Ada' και μετά 'Grace'. Η δεύτερη έξοδος περιέχει και τα δύο. Κάλεσε fixed function δύο φορές με ανεξάρτητα outputs και μετά πέρασε ρητά shared list.

**Κριτήριο:** κράτησε test του αρχικού bug, έλεγξε fixed έκδοση σε normal και boundary case και μην επεξεργάζεσαι πραγματικά δεδομένα χρήστη.

## Python: λείπει η κωδικοποίηση

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
text = open("notes.txt").read()
```

### Διορθωμένο παράδειγμα

```text
from pathlib import Path
text = Path("notes.txt").read_text(encoding="utf-8")
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Η ρητή UTF-8 διατηρεί σωστά τα ελληνικά κείμενα.

### Πραγματική αιτία
Τα text files περιέχουν bytes, όχι δεδομένο Python encoding. Λάθος codec αλλοιώνει ή απορρίπτει χαρακτήρες· η καταστολή Unicode errors με ignore χάνει πληροφορία.

### Επαναλήψιμο regression πείραμα
Γράψε 'Καλημέρα' σε προσωρινό UTF-8 file και σύγκρινε bytes με code points. Δοκίμασε invalid byte fixture και διάβασε UnicodeDecodeError χωρίς να αλλάξεις original.

## Python: κρυμμένες εξαιρέσεις

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
try:
    work()
except Exception:
    pass
```

### Διορθωμένο παράδειγμα

```text
try:
    work()
except ValueError as exc:
    print(f"Invalid value: {exc}")
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Πιάσε μόνο αναμενόμενα σφάλματα και εμφάνισέ τα.

### Πραγματική αιτία
Ένα γενικό except που επιστρέφει κενό αποτέλεσμα κάνει αποτυχία να μοιάζει επιτυχία. Ο σωστός χειρισμός γίνεται σε layer που ξέρει αν απαιτείται retry, εξήγηση ή abort.

### Επαναλήψιμο regression πείραμα
Προκάλεσε ValueError σε parser και FileNotFoundError στο file-reading boundary. Μόνο αναμενόμενα errors πρέπει να μετατρέπονται σε μηνύματα· programming bugs να φαίνονται στα tests.

## JavaScript: λανθασμένη σύγκριση

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
if (count = 3) console.log("three");
```

### Διορθωμένο παράδειγμα

```text
if (count === 3) console.log("three");
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Η ανάθεση δεν είναι σύγκριση· προτίμησε αυστηρή ισότητα.

### Πραγματική αιτία
Η loose equality κάνει coercion: string '0' μπορεί να θεωρηθεί ίσο με number 0. Η strict equality διατηρεί τη διαφορά, αλλά η μετατροπή input χρειάζεται ξεχωριστό validation.

### Επαναλήψιμο regression πείραμα
Σύγκρινε ('0',0), (false,0) και (null,undefined) με ==/===. Μετέτρεψε ρητά τον επιθυμητό input type πριν comparison.
