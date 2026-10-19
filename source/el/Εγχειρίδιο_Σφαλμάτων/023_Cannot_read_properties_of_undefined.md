# Cannot read properties of undefined — ρητός έλεγχος αναζήτησης

## Ερμηνεία και αρχική αιτία
Η JavaScript επιστρέφει undefined όταν λείπει ιδιότητα ενός αντικειμένου ή όταν η Array.find δεν βρίσκει εγγραφή. Αν ο κώδικας προσπαθήσει αμέσως να διαβάσει άλλη ιδιότητα από αυτήν την τιμή, προκύπτει TypeError. Το stack trace δείχνει τη χρήση της ελλείπουσας τιμής, αλλά η αρχική λανθασμένη υπόθεση μπορεί να βρίσκεται πολύ νωρίτερα.

## Τρόπος διόρθωσης
Η readTitle απαιτεί πραγματικό πίνακα και αναζητά εγγραφή με ID. Η απουσία εγγραφής είναι ένα σαφές RangeError που περιλαμβάνει το ζητούμενο ID. Μία εγγραφή με κενό τίτλο αποτελεί ξεχωριστό σφάλμα σχήματος και γίνεται TypeError. Έτσι δεν προκύπτει τυχαίο crash σε μεταγενέστερο σημείο εμφάνισης.

## Εκτελέσιμο παράδειγμα
Αποθήκευσε ως undefined_lab.cjs.

~~~javascript
function readTitle(records, id) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const found = records.find(item => item && item.id === id);
  if (found === undefined) throw new RangeError('missing record: ' + id);
  if (typeof found.title !== 'string' || !found.title.trim())
    throw new TypeError('invalid title at ID ' + id);
  return found.title;
}
const records = [{id: 1, title: 'Intro'}, {id: 2, title: ''}];
if (readTitle(records, 1) !== 'Intro') throw Error('bad title');
for (const [input, id, expected] of [
  [records, 3, RangeError],
  [records, 2, TypeError],
  [null, 1, TypeError],
]) {
  try { readTitle(input, id); throw Error('bad input accepted'); }
  catch (error) { if (!(error instanceof expected)) throw error; }
}
console.log('PASS: find absence, invalid payload, missing title');
~~~

## Γιατί έχει σημασία
Το optional chaining (`found?.title`) αποτρέπει μία αποαναφορά, αλλά δεν βεβαιώνει ότι υπάρχει ο απαιτούμενος τίτλος. Είναι κατάλληλο μόνο για προαιρετικά πεδία. Πριν από το `typeof found.title` πρέπει να γνωρίζεις ότι το found είναι αντικείμενο. Σκέψου επίσης αν τα δεδομένα επιτρέπουν κενές null εγγραφές.

## Επαλήθευση
Αποθήκευσε ως undefined_lab.cjs και εκτέλεσε node undefined_lab.cjs. Αναμενόμενη έξοδος PASS. Οι δοκιμές καλύπτουν σωστό ID, ανύπαρκτο ID, άκυρο τίτλο και είσοδο που δεν είναι πίνακας. Δεν χρειάζεται DOM ή διαδίκτυο.

## Ασκήσεις και όρια
Σύγκρινε Array.find με Array.findIndex και την τιμή -1 που δηλώνει απουσία. Δοκίμασε διπλά ID και αποφάσισε αν επιτρέπεται η πρώτη αντιστοίχιση ή πρέπει να απορρίπτονται οι διπλές εγγραφές. Πρόσθεσε null μέσα στον πίνακα και εξήγησε τι προστατεύει ο έλεγχος `item &&`.

**Πρωτογενής πηγή:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
