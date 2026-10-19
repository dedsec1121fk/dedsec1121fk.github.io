# Failed to fetch — ξεχώρισε δίκτυο, HTTP και μη έγκυρα δεδομένα

## Ερμηνεία και αρχική αιτία
Το Fetch API του browser συνήθως ολοκληρώνει επιτυχώς το Promise όταν λαμβάνει HTTP 404 ή 500, παρότι η απάντηση δηλώνει σφάλμα. Απορρίπτει το Promise σε πρόβλημα μεταφοράς, ακύρωση ή ορισμένους περιορισμούς του browser όπως CORS. Αν ονομάζεις κάθε μη επιτυχημένο status Failed to fetch, χάνεις την πραγματική διάγνωση. Οι περιορισμοί CORS δεν διορθώνονται απενεργοποιώντας την ασφάλεια ή με no-cors για να διαβάσεις το περιεχόμενο.

## Τρόπος διόρθωσης
Φτιάξε αναγνώστη ρυθμίσεων που δέχεται τη συνάρτηση μεταφοράς ως παράμετρο. Δεν κάνει πραγματικά αιτήματα. Ελέγχει χωριστά αποτυχία μεταφοράς, HTTP status και το αναμενόμενο σχήμα JSON. Οι δοκιμές προσομοιώνουν επιτυχία 200, HTTP 404, HTTP 500, απόρριψη δικτύου και εσφαλμένη τιμή ρύθμισης.

## Εκτελέσιμο παράδειγμα
Αποθήκευσε ως fetch_lab.cjs.

~~~javascript
async function getConfig(transport) {
  let response;
  try { response = await transport('/config.json'); }
  catch (cause) { throw new Error('transport rejected', {cause}); }
  if (!response || typeof response.status !== 'number')
    throw new TypeError('invalid response object');
  if (response.status < 200 || response.status >= 300)
    throw new Error('HTTP ' + response.status);
  const data = await response.json();
  if (!data || typeof data.enabled !== 'boolean')
    throw new TypeError('invalid config JSON');
  return data.enabled;
}
async function main() {
  if (await getConfig(async () => ({status: 200, json: async () => ({enabled: true})})) !== true) throw Error();
  for (const [transport, re] of [
    [async () => ({status: 404, json: async () => ({})}), /HTTP 404/],
    [async () => ({status: 500, json: async () => ({})}), /HTTP 500/],
    [async () => { throw new TypeError('Failed to fetch'); }, /transport rejected/],
    [async () => ({status: 200, json: async () => ({enabled: 'yes'})}), /invalid config/],
  ]) {
    try { await getConfig(transport); throw Error('invalid response accepted'); }
    catch (error) { if (!re.test(error.message)) throw error; }
  }
  console.log('PASS: resolved HTTP failures, rejected network and schema mismatch');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
~~~

## Γιατί έχει σημασία
Το τεχνητό Response έχει αριθμητικό status. Στον πραγματικό browser χρησιμοποίησε response.ok και response.status, επιβεβαίωσε τον τύπο περιεχομένου και μετά έλεγξε το JSON. Το παράδειγμα δεν προσομοιώνει τη μηχανή CORS του browser. Ένα AbortError από ακύρωση χρήστη χρειάζεται συχνά διαφορετικό χειρισμό από την αποτυχία σύνδεσης.

## Επαλήθευση
Αποθήκευσε ως fetch_lab.cjs και εκτέλεσε node fetch_lab.cjs σε Node 18 ή νεότερο. Αναμενόμενη έξοδος PASS, χωρίς καμία σύνδεση με εξωτερικό δίκτυο.

## Ασκήσεις και όρια
Σε δικό σου τοπικό δοκιμαστικό server ζήτησε μία ανύπαρκτη διαδρομή και διαπίστωσε ότι η Response συνήθως επιστρέφεται κανονικά. Για CORS, μικτό HTTP/HTTPS και ανακατευθύνσεις χρησιμοποίησε τα εργαλεία Network και Console του browser. Μην βάζεις mode:no-cors ως δήθεν διόρθωση: η opaque απάντηση δεν σου δίνει πρόσβαση στο περιεχόμενό της.

**Πρωτογενής πηγή:** https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
