# JavaScript Unexpected token — λάθος σύνταξης ή απάντηση διαφορετικής μορφής

## Ερμηνεία και αρχική αιτία
Το Unexpected token δηλώνει αποτυχία ανάλυσης, αλλά πρώτα πρέπει να βρεις ποιος parser την παρήγαγε. Ένα συντακτικό λάθος σε αρχείο JavaScript διαφέρει από σφάλμα JSON.parse σε απάντηση δικτύου. Η σύνταξη JSON είναι αυστηρότερη: δεν επιτρέπει κόμμα στο τέλος, σχόλια ή ονόματα ιδιοτήτων χωρίς εισαγωγικά. Ένας διακομιστής μπορεί να επιστρέψει HTML αντί JSON και να εμφανιστεί μήνυμα με το σύμβολο '<'.

## Τρόπος διόρθωσης
Η parsePayload ελέγχει πρώτα ότι ο τύπος περιεχομένου είναι JSON και μετά καλεί JSON.parse. Μόνο την αποτυχία ανάλυσης τη μετατρέπει σε σαφή SyntaxError με αρχική αιτία. Δοκιμάζει κανονικά δεδομένα, περιττό κόμμα, HTML με λανθασμένο τύπο και μη έγκυρο κείμενο. Δεν απαιτούνται πραγματικά αιτήματα δικτύου.

## Εκτελέσιμο παράδειγμα
Αποθήκευσε ως unexpected_lab.cjs.

~~~javascript
function parsePayload(body, contentType) {
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType || ''))
    throw new TypeError('expected JSON content type');
  try { return JSON.parse(body); }
  catch (cause) { throw new SyntaxError('invalid response JSON', {cause}); }
}
const ok = parsePayload('{"ready":true}', 'application/json; charset=utf-8');
if (ok.ready !== true) throw Error('wrong parsed value');
for (const [body, mime, expected] of [
  ['{"ready":true,}', 'application/json', SyntaxError],
  ['<html>oops</html>', 'text/html', TypeError],
  ['not json', 'application/json', SyntaxError],
]) {
  try { parsePayload(body, mime); throw Error('malformed response accepted'); }
  catch (error) { if (!(error instanceof expected)) throw error; }
}
console.log('PASS: valid JSON, trailing comma, wrong MIME, malformed JSON');
~~~

## Γιατί έχει σημασία
Ο έλεγχος MIME είναι περιορισμένος στο application/json για το εργαστήριο. Πραγματικές υπηρεσίες μπορεί να χρησιμοποιούν και τύπους που τελειώνουν σε +json. Σωστό MIME δεν εγγυάται σωστή δομή δεδομένων. Πριν τη μετατροπή της απάντησης έλεγξε response.ok και status και μετά επαλήθευσε τα απαραίτητα πεδία.

## Επαλήθευση
Αποθήκευσε ως unexpected_lab.cjs και εκτέλεσε node unexpected_lab.cjs σε Node 18 ή νεότερο. Αναμένεται PASS. Για λάθη σύνταξης του πηγαίου κώδικα χρησιμοποίησε node --check example.js πάνω σε προσωρινό αρχείο και ξεχώρισε τον έλεγχο σύνταξης από την εκτέλεση JSON.parse.

## Ασκήσεις και όρια
Άλλαξε το σωστό JSON ώστε να έχει κλειδί χωρίς εισαγωγικά, σχόλιο ή επιπλέον κόμμα. Κατάγραψε την αποτυχία του parser. Προσομοίωσε HTML από δικό σου δοκιμαστικό περιβάλλον χωρίς εξωτερικά αιτήματα. Μη χρησιμοποιείς eval ως εναλλακτικό JSON parser.

**Πρωτογενής πηγή:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
