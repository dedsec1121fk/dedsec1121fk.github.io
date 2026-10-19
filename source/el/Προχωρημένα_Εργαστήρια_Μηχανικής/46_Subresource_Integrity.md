# Ακεραιότητα εξωτερικών πόρων και δέσμευση εκδόσεων

## Μηχανισμός και συμβόλαιο

Ένα hash ακεραιότητας συνδέει αναφορά script ή stylesheet με αναμενόμενα bytes. Αν το CDN επιστρέψει άλλα bytes, ο browser μπορεί να απορρίψει τον πόρο. Αυτό προστατεύει μία λήψη, χωρίς να ελέγχει συμπεριφορά κώδικα, όλο το γράφημα εξαρτήσεων ή παραβιασμένη σελίδα που αλλάζει το δικό της γνώρισμα integrity.

Η ενημέρωση έκδοσης πρέπει να αλλάζει μαζί URL και αναμενόμενο hash σε ελεγμένη αλλαγή. Υπολόγισε hash στα ακριβή δημοσιευμένα bytes, όχι σε αναμορφοποιημένη τοπική πηγή. Οι έλεγχοι άλλης προέλευσης εξαρτώνται και από CORS του πόρου. Σε βιβλιοθήκη εκτός σύνδεσης η τοπική φιλοξενία ελεγμένης εξάρτησης μειώνει εξαρτήσεις διαθεσιμότητας και ιδιωτικότητας, ενώ η ακεραιότητα προσθέτει έλεγχο στους εξωτερικούς πόρους.

## Τοπικό παράδειγμα

```python
import base64, hashlib
fixture = b"console.log('reviewed fixture');\n"
integrity = "sha384-" + base64.b64encode(hashlib.sha384(fixture).digest()).decode("ascii")
changed = fixture + b"// changed\n"
assert hashlib.sha384(fixture).digest() != hashlib.sha384(changed).digest()
print(integrity)
# Put the printed value in integrity="..." only for these exact fixture bytes.
```

## Έλεγχοι αποτυχίας και όρια

Κατασκεύασε τοπική σελίδα με σωστό hash, άλλαξε ένα byte και παρατήρησε απόρριψη πόρου και σφάλμα κονσόλας. Δοκίμασε και τη ρύθμιση crossorigin. Κράτησε ζεύγος URL και digest για επαναφορά. Ένα checksum που παράγεται αυτόματα από ανεξέταστη λήψη σε κάθε build δεν αποδεικνύει έγκριση της έκδοσης.

## Πρωτογενής αναφορά

[Επίσημη τεκμηρίωση](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity)
