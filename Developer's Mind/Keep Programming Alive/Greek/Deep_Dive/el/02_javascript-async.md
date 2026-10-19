# JavaScript promises και προβλήματα χρονισμού

## Τι συμβαίνει
Ένα promise ολοκληρώνεται αργότερα. Ο κώδικας μετά την async κλήση μπορεί να εκτελεστεί πριν από το αποτέλεσμα. Μοντελοποίησε φόρτωση, επιτυχία, ακύρωση και αποτυχία ως καταστάσεις.

## Πρακτικός έλεγχος
Χρησιμοποίησε AbortController για παλιά αιτήματα όταν αλλάζει η αναζήτηση. Πρόσθεσε αναγνωριστικό ώστε προηγούμενη απάντηση να μην αντικαταστήσει νέα δεδομένα.

## Συνήθεις παγίδες
Χειρίσου την απόρριψη και επανάφερε το UI στο finally. Timeout δικτύου και σφάλμα JSON απαιτούν διαφορετικά μηνύματα.

## Μικρό παράδειγμα για προσαρμογή
```text
node --check app.js
```

## Απόδειξε ποιο request δικαιούται να ενημερώσει το UI
~~~javascript
let current = 0;
let displayed = null;
function begin() { return ++current; }
function finish(id, value) {
  if (id === current) displayed = value;
}
const old = begin();
const latest = begin();
finish(latest, 'new result');
finish(old, 'stale result');
if (displayed !== 'new result') throw new Error('stale overwrite');
~~~
Το fixture αντιστρέφει completion order χωρίς δίκτυο ή timers. Το cancellation εξοικονομεί δουλειά, αλλά το request ID προστατεύει και από απάντηση που έχει ήδη μπει στην ουρά. Στην εφαρμογή προστάτευσε επίσης loading/error updates: παλιό finally δεν πρέπει να κρύβει το spinner νεότερου request.

Μια async function επιστρέφει promise ακόμη κι αν κάνει return απλή τιμή. Caller χωρίς await μπορεί να εμφανίσει promise object. Ξεχώρισε parse rejection από HTTP response με error status: το fetch δεν απορρίπτει αποκλειστικά επειδή το HTTP είναι 404. Αυτές οι περιπτώσεις χρειάζονται διακριτές μεταβάσεις κατάστασης.
