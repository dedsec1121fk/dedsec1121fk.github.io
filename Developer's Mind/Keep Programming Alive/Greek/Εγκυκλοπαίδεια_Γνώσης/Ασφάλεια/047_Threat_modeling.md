# Μοντελοποίηση απειλών, ελάχιστα δικαιώματα και συγκατάθεση

## Μοντελοποίηση απειλών

**Κατηγορία:** Ασφάλεια

### Βασική γνώση

Κατάγραψε περιουσιακά στοιχεία, όρια εμπιστοσύνης, πιθανούς επιτιθέμενους και συνέπειες πριν επιλέξεις μέτρα. Εστίασε σε πραγματικές καταχρήσεις και προστασία δεδομένων.

### Πρακτική εφαρμογή

Κατάγραψε κινδύνους όταν τοπικός διακομιστής δέχεται διαδρομές αρχείων.

### Συγκεκριμένο όριο εμπιστοσύνης
Όρισε assets (private files, tokens), entry points (upload, CLI) και trust boundaries (user input, filesystem). Σενάριο απειλής χρειάζεται δυνατότητα attacker, προϋπόθεση, impact και ελέγξιμο mitigation· απλή λίστα «hacking» δεν βοηθά.

### Ελεγχόμενο παράδειγμα
```python
assets={'token':'secret','readme':'public'}
assert assets['token']!='public'
# Test access control at each boundary, not by renaming a file.
```

### Εργαστήριο επαλήθευσης
Σχεδίασε data-flow για ZIP import: bytes -> extraction -> indexing -> public site. Εξέτασε path traversal, μέγεθος, scripts και private metadata· πρόσθεσε αρνητικό test ανά boundary.

**Πηγή:** https://owasp.org/www-community/Threat_Modeling

## Ελάχιστα δικαιώματα

**Κατηγορία:** Ασφάλεια

### Βασική γνώση

Ζήτησε μόνο τις άδειες που απαιτούνται για συγκεκριμένη ενέργεια και χώρισε τις προνομιούχες εργασίες. Η ευκολία δεν δικαιολογεί γενική πρόσβαση σε ιδιωτικά αρχεία, κάμερα ή μικρόφωνο.

### Πρακτική εφαρμογή

Έλεγξε μία λειτουργία και αφαίρεσε άδειες που δεν χρειάζονται.

### Συγκεκριμένο όριο εμπιστοσύνης
Κάθε process χρειάζεται μόνο τα αναγκαία δικαιώματα και για τον αναγκαίο χρόνο. Ανάγνωση document δεν δικαιολογεί Git push, preview ZIP δεν χρειάζεται production write. Ο ρόλος από μόνος του δεν αρκεί: έλεγξε resource και action.

### Ελεγχόμενο παράδειγμα
```python
grants={'reviewer':{'read'},'publisher':{'read','publish'}}
assert 'publish' not in grants['reviewer']
assert 'publish' in grants['publisher']
```

### Εργαστήριο επαλήθευσης
Φτιάξε matrix δικαιωμάτων για visitor, editor και release manager· δοκίμασε denied/allowed actions. Αν credentials εκτεθούν, κάνε rotation και ποτέ μην τα βάζεις σε public repo.

**Πηγή:** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

## Ασφαλείς προεπιλογές και συγκατάθεση

Η εξουσιοδότηση, η ιδιωτικότητα, τα ελάχιστα δικαιώματα και η ρητή επιλογή χρήστη είναι απαιτήσεις σχεδιασμού. Μην βάζεις πραγματικά κλειδιά API σε ασκήσεις. Μην παρέχεις παραπλανητική συλλογή κωδικών ή κρυφή πρόσβαση σε κάμερα/μικρόφωνο.

### Λυμένο παράδειγμα

```text
import secrets
token = secrets.token_hex(16)
print("generated token length:", len(token))
```

### Άσκηση

Εξήγησε γιατί η αποθήκευση μυστικών στο αποθετήριο είναι επικίνδυνη.

### Λύση / υπόδειξη

Το αποθετήριο αντιγράφεται και μπορεί να διαρρεύσει· χρησιμοποίησε ασφαλή αποθήκη.

### Threat model για τοπική αναζήτηση αρχείων
Καθόρισε περιουσιακό στοιχείο (αρχεία μαθημάτων), είσοδο (κείμενο χρήστη), όριο εμπιστοσύνης (κείμενο μετατρέπεται σε path) και επίπτωση (ανάγνωση εκτός αρχείου).

~~~python
from pathlib import Path
def under_root(root, relative):
    base = Path(root).resolve()
    candidate = (base / relative).resolve()
    return candidate.is_relative_to(base)
assert under_root("/tmp/lessons", "course.md")
assert not under_root("/tmp/lessons", "../secret.txt")
~~~

Η δοκιμή εξετάζει απλή διαφυγή φακέλου αλλά **δεν** αποτελεί race-proof sandbox: παράλληλη αλλαγή symlink μπορεί να ακυρώσει τον έλεγχο πριν από το open. Σε εχθρικούς καταλόγους χρειάζονται ισχυρότερες εγγυήσεις λειτουργικού. Έλεγξε επίσης διαρροή token σε διαγνωστικά, εκτέλεση μη έμπιστου HTML κατά το rendering και απροσδόκητα δικτυακά αιτήματα offline λειτουργιών. Όρισε συγκεκριμένη δοκιμή για κάθε απειλή. Πηγή: https://owasp.org/www-project-application-security-verification-standard/

## DedSec legal consent declined

**Γλώσσα / περιβάλλον:** DedSec

### Τι σημαίνει
Η εγκατάσταση σταμάτησε επειδή δεν υπήρξε αποδοχή των όρων.

### Πώς διορθώνεται
Εκτέλεσε ξανά bash Setup.sh, διάβασε με re/rg και αποδέξου μόνο αν συμφωνείς.
