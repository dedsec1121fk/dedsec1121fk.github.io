# Unhandled Promise rejection — ποιος χειρίζεται την αποτυχία;

## Ασφαλής αναπαραγωγή
Μια απορριφθείσα Promise διαδίδεται μέχρι να βρεθεί rejection handler. Browser και Node μπορεί να έχουν διαφορετική συμπεριφορά ανά έκδοση· ένα global unhandled-rejection event δεν είναι ο κανονικός τρόπος χειρισμού.

~~~javascript
async function parseRemote(load) {
  const response = await load();
  if (!response.ok) throw new Error("HTTP " + response.status);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new TypeError("expected array");
  return payload;
}
async function main() {
  try {
    return await parseRemote(async () => ({
      ok: false, status: 503, json: async () => []
    }));
  } catch (error) {
    console.assert(error.message === "HTTP 503");
    return [];
  }
}
main().then(rows => console.assert(rows.length === 0))
      .catch(error => { console.error(error); });
~~~

## Σωστό boundary
Μια async function επιστρέφει Promise. Ένα συγχρονικό try/catch γύρω από κλήση *χωρίς await* δεν πιάνει μεταγενέστερο rejection. Χρησιμοποίησε await μέσα στο try/catch ή αλυσίδα .catch. Κράτα τον χειρισμό κοντά σε UI, CLI ή job runner που ξέρει αν πρέπει να αναφέρει ή να ξαναδοκιμάσει.

## Πρόκληση
Δοκίμασε άκυρο JSON shape, HTTP 503 και Promise που απορρίπτεται λόγω δικτύου. Κάθε περίπτωση πρέπει να επιστρέφει αναμενόμενο diagnostic. Μην κάνεις αυτόματο retry σε ενέργεια που μπορεί να έχει ήδη προκαλέσει μη αναστρέψιμο side effect.

Πηγή: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises

## Πού ανήκει η αποτυχία ενός Promise;
~~~js
async function load() { throw new Error("offline"); }
async function main() {
  try { await load(); }
  catch (error) { console.assert(error.message === "offline"); }
}
main();
~~~
Το `try/catch` πρέπει να περιβάλλει πραγματικά το `await` του Promise. Αν απλώς καλέσεις `load()` και αγνοήσεις το αποτέλεσμα, το rejection μπορεί να μείνει χωρίς χειρισμό. Με `Promise.all` η πρώτη απόρριψη απορρίπτει το συνδυασμένο Promise, ενώ το `Promise.allSettled` καταγράφει ξεχωριστά όλα τα αποτελέσματα. Διάλεξε βάσει της σημασίας της εργασίας: για ανεξάρτητα downloads ίσως χρειάζεσαι όλα τα statuses, για συναλλαγή που απαιτεί όλα τα βήματα η απόρριψη μπορεί να είναι αναγκαία. Το `.catch(() => {})` κρύβει σφάλματα και δεν είναι λύση.
