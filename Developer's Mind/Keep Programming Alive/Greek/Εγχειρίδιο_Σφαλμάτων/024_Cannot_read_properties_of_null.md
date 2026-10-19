# Cannot read properties of null — ρητή απουσία έναντι χαλασμένων δεδομένων

## Ερμηνεία και αρχική αιτία
Το JSON περιέχει την τιμή null, ενώ μία ιδιότητα που λείπει από το αντικείμενο της JavaScript δίνει undefined. Και οι δύο τιμές προκαλούν σφάλμα όταν προσπελάζεις ιδιότητές τους, αλλά δεν σημαίνουν απαραίτητα το ίδιο. Το null μπορεί να δηλώνει επιτρεπτό επισκέπτη χωρίς λογαριασμό, ενώ μία υποχρεωτική ιδιότητα user που λείπει σημαίνει άκυρη απάντηση. Αν τις αντικαθιστάς όλες με κενό προφίλ, κρύβεις σφάλματα δεδομένων.

## Τρόπος διόρθωσης
Η profileName επιτρέπει ρητά το user:null ως κατάσταση επισκέπτη και δέχεται αντικείμενο user μόνο όταν διαθέτει μη κενό όνομα. Απορρίπτει απούσα ιδιότητα, ιδιότητα με undefined, null στην κορυφή και εσφαλμένο αντικείμενο χρήστη. Οι δοκιμές αποδεικνύουν ότι ο κανόνας πρέπει να εφαρμόζεται στην είσοδο.

## Εκτελέσιμο παράδειγμα
Αποθήκευσε ως null_lab.cjs.

~~~javascript
function profileName(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new TypeError('profile payload must be an object');
  if (!Object.hasOwn(payload, 'user')) throw new TypeError('user field missing');
  if (payload.user === null) return 'Guest'; // explicitly allowed state
  if (!payload.user || typeof payload.user.name !== 'string' || !payload.user.name.trim())
    throw new TypeError('user object is invalid');
  return payload.user.name;
}
if (profileName(JSON.parse('{"user":null}')) !== 'Guest') throw Error('null state wrong');
if (profileName({user: {name: 'Ada'}}) !== 'Ada') throw Error('profile wrong');
for (const invalid of [{}, {user: undefined}, {user: {}}, null]) {
  try { profileName(invalid); throw Error('invalid profile accepted'); }
  catch (error) { if (!(error instanceof TypeError)) throw error; }
}
console.log('PASS: explicit null state, absent key, malformed object');
~~~

## Γιατί έχει σημασία
Η Object.hasOwn ξεχωρίζει κλειδί που λείπει από κληρονομημένη ιδιότητα. Το optional chaining είναι κατάλληλο όταν το UI επιτρέπει πραγματικά την κατάσταση null. Ωστόσο η έκφραση `payload.user?.name || 'Guest'` αποκρύπτει επίσης ένα χαλασμένο προφίλ. Το `typeof null` επιστρέφει 'object' λόγω ιστορικής συμπεριφοράς, συνεπώς απαιτείται ξεχωριστός έλεγχος.

## Επαλήθευση
Αποθήκευσε ως null_lab.cjs και εκτέλεσε node null_lab.cjs. Η αναμενόμενη έξοδος είναι PASS. Τα δεδομένα είναι τεχνητά και η Object.hasOwn είναι διαθέσιμη σε σύγχρονες εκδόσεις Node.

## Ασκήσεις και όρια
Σύγκρινε το αποτέλεσμα των `JSON.parse('{}').user` και `JSON.parse('{"user":null}').user`. Πρόσθεσε δοκιμή για κενό όνομα, αριθμητική τιμή user και κληρονομημένη ιδιότητα. Κατάγραψε ποιες καταστάσεις επιτρέπονται αντί να χρησιμοποιείς παντού προεπιλεγμένη τιμή.

**Πρωτογενής πηγή:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
