# javascript — συγκεντρωτικός οδηγός

## JavaScript

**Συνήθης χρήση:** Γλώσσες διαδικτύου.

**Προτεινόμενη επέκταση αρχείου:** `.js`.

**Εκτέλεση / περιβάλλον:** node hello.js (ή κονσόλα προγράμματος περιήγησης).

### Αρχικό παράδειγμα

```
function greet(name) {
  return `Hello, ${name}!`;
}
for (const name of ["Ada", "Grace"]) console.log(greet(name));
```

### Πώς διαβάζεται

Τα const/let δηλώνουν μεταβλητές· τα πρότυπα συμβολοσειρών ενσωματώνουν τιμές.

### Συνηθισμένο λάθος

Τα const/let δηλώνουν μεταβλητές· τα πρότυπα συμβολοσειρών ενσωματώνουν τιμές. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Όρια runtime και event loop
Η JavaScript εκτελείται σε browser και server runtimes, αλλά οι διαθέσιμες APIs διαφέρουν. Το `document` είναι browser API· πρόσβαση σε filesystem εξαρτάται από το server runtime. Τα Promises είναι ασύγχρονα· το `await` αναμένει μέσα στη συνάρτηση χωρίς να παγώνει όλα τα events.
```javascript
function parseScore(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0 || n > 100) throw Error("invalid score");
  return n;
}
console.assert(parseScore("42") === 42);
```
Για μη έμπιστο κείμενο χρησιμοποίησε `textContent`, όχι `innerHTML`. Το `fetch` δεν απορρίπτει Promise μόνο επειδή πήρε 404/500: έλεγξε `response.ok`, timeout με `AbortController` και σχήμα JSON. Πρόσεχε ότι `Number("") === 0`.

**Άσκηση:** τοπική αναζήτηση με debounce, Escape, `aria-live`, ελληνικά/Unicode και πλήρη χειρισμό πληκτρολογίου. Πηγή: https://developer.mozilla.org/en-US/docs/Web/JavaScript.

### Εργαστήριο JavaScript: σειρά εκτέλεσης

Τα promises δεν εκτελούνται σαν να ήταν απλές σύγχρονες τιμές. Δοκίμασε σε Browser DevTools ή σε κατάλληλο JavaScript runtime:

~~~javascript
const output = [];
output.push('A');
setTimeout(() => output.push('D'), 0);
Promise.resolve().then(() => output.push('C'));
output.push('B');
setTimeout(() => console.log(output.join(',')), 20);
~~~

Πριν το τρέξεις πρόβλεψε A,B,C,D. Τα A και B είναι σύγχρονα, η συνάρτηση του Promise μπαίνει σε microtask queue και το timer είναι μεταγενέστερο task. Ο πραγματικός χρόνος timer δεν είναι εγγυημένος, ιδίως όταν μια καρτέλα περιορίζεται.

Έπειτα δημιούργησε δύο εικονικά αιτήματα που επιστρέφουν με ανάποδη σειρά. Δώσε αύξον ID και εμφάνισε αποτέλεσμα μόνο αν το ID αντιστοιχεί στο τελευταίο αίτημα. Έτσι η παλαιότερη αργή αναζήτηση δεν αντικαθιστά τη νεότερη.

Για κείμενο χρήστη προτίμησε textContent: το innerHTML ερμηνεύει markup και χρειάζεται ελέγχους εμπιστοσύνης. Χρησιμοποίησε addEventListener και δοκίμασε πληκτρολόγιο, εστίαση και κινητό.

**Παραδοτέο:** προβλεπόμενη σειρά εξόδου, δοκιμή παλιού ασύγχρονου αποτελέσματος και εξήγηση microtask έναντι timer task. Πηγή: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop.

## JavaScript — Αναλυτικός οδηγός εξάσκησης

### Αναγνώριση του race condition
Μία παλαιότερη, αργή απάντηση μπορεί να φτάσει μετά από νεότερο ερώτημα. Το debounce περιορίζει κλήσεις αλλά δεν καθορίζει τη σειρά ολοκλήρωσης. Χρειάζεται μοναδικός αυξανόμενος αριθμός για κάθε αίτημα.

### Αναπαραγωγή χωρίς δίκτυο
Αποθήκευσε search.js και τρέξε node search.js. Μία Promise κρατά τεχνητά την παλιά απάντηση. Η αναμενόμενη έξοδος είναι latest: Beta. Προέβλεψε ποιο αίτημα θα αγνοηθεί.

~~~javascript
function createSearch() {
  let newest = 0;
  return async (term, request) => {
    const ticket = ++newest;
    const rows = await request(term);
    if (ticket !== newest) return null;
    if (!Array.isArray(rows) || !rows.every(x => typeof x === "string"))
      throw TypeError("titles must be strings");
    return rows.filter(x => x.toLowerCase().includes(term.toLowerCase()));
  };
}
async function test() {
  const search = createSearch();
  let release;
  const old = search("a", () => new Promise(resolve => { release = resolve; }));
  const current = await search("be", () => Promise.resolve(["Beta", "Alpha"]));
  release(["Alpha"]);
  if (current.join(",") !== "Beta" || await old !== null) throw Error("stale data");
  console.log("latest: Beta");
}
test().catch(e => { console.error(e); process.exitCode = 1; });
~~~

### Πώς εμπλέκεται το event loop
Η async συνάρτηση επιστρέφει Promise αμέσως. Μετά το await συνεχίζει όταν επιλυθεί η Promise, μέσω της ουράς microtasks. Ο έλεγχος ticket αφορά τη σειρά των αιτημάτων, όχι την ταχύτητα. Πρόσθεσε δοκιμές με τρεις αναζητήσεις και με απορριφθείσα παλιά Promise.

### Σύνδεση με διεπαφή
Σύνδεσε input listener και aria-live μήνυμα για τα αποτελέσματα. Απόφυγε innerHTML για μη έμπιστο κείμενο· χρησιμοποίησε textContent. Στο πραγματικό fetch έλεγξε response.ok για HTTP 404/500. Το AbortController βοηθά, αλλά δεν αντικαθιστά τον έλεγχο ticket. Μην εμφανίζεις σφάλμα από ήδη παλιό αίτημα.

### Διάγνωση
Το document undefined σημαίνει χρήση browser API σε Node. Αν τα αποτελέσματα αλλάζουν προς τα πίσω, κατέγραψε τα tickets στην αρχή και στο τέλος. Χειρίσου τις rejected Promises στο επίπεδο διεπαφής.
Επιτυχία: η παλιά απάντηση αγνοείται. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

## JavaScript — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `node {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## JavaScript — Διαδρομή ουσιαστικής εξάσκησης

### Σκοπός και περιορισμοί
Θα κατασκευάσεις έναν αναγνώστη σελίδων API χωρίς πραγματικά αιτήματα δικτύου. Η συνάρτηση δέχεται ως παράμετρο τον μηχανισμό μεταφοράς, ώστε οι δοκιμές να ελέγχουν ακριβώς τις απαντήσεις HTTP και τα δεδομένα JSON. Επιτρέπονται μόνο σχετικές διαδρομές /api/items και σύντομοι δείκτες cursor. Απόλυτες διευθύνσεις, κύκλοι σελιδοποίησης, διπλά αναγνωριστικά, λανθασμένοι τύποι και υπέρβαση του ορίου σελίδων απορρίπτονται.

### Εκτέλεση
Αποθήκευσε ως pages_lab.js και εκτέλεσε node pages_lab.js με Node 18 ή νεότερο. Ο ψεύτικος μηχανισμός μεταφοράς επιστρέφει δύο σελίδες και προσομοιώνει έξι αποτυχίες. Δεν απαιτούνται πρόσθετες βιβλιοθήκες, φυλλομετρητής ή σύνδεση στο διαδίκτυο.

~~~javascript
"use strict";
const assert = require("node:assert/strict");
const permitted = /^\/api\/items(?:\?cursor=[A-Za-z0-9_-]{1,20})?$/;

async function collect(fetchPage, start = "/api/items", maxPages = 4) {
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 10)
    throw new RangeError("invalid page budget");
  const visited = new Set(), ids = new Set(), items = [];
  let next = start;
  while (next !== null) {
    if (typeof next !== "string" || !permitted.test(next))
      throw new Error("untrusted next URL");
    if (visited.has(next)) throw new Error("pagination cycle");
    if (visited.size >= maxPages) throw new Error("page budget exceeded");
    visited.add(next);
    const response = await fetchPage(next);
    if (!response || response.ok !== true || typeof response.json !== "function")
      throw new Error("HTTP failure: " + (response?.status ?? "no response"));
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.items) ||
        !(payload.next === null || typeof payload.next === "string"))
      throw new Error("invalid response schema");
    for (const item of payload.items) {
      if (!item || typeof item.id !== "string" || !/^[A-Z][0-9]{1,3}$/.test(item.id) ||
          typeof item.label !== "string" || item.label.length > 80)
        throw new Error("invalid item");
      if (ids.has(item.id)) throw new Error("duplicate item id");
      ids.add(item.id);
      items.push({id: item.id, label: item.label});
    }
    next = payload.next;
  }
  return items; // No partial result escapes if a later page fails.
}

async function test() {
  const pages = {
    "/api/items": {items: [{id: "A1", label: "<b>untrusted label</b>"}],
                   next: "/api/items?cursor=two"},
    "/api/items?cursor=two": {items: [{id: "B2", label: "second"}], next: null}
  };
  const fake = async url => ({ok: true, status: 200, json: async () => pages[url]});
  assert.deepEqual((await collect(fake)).map(x => x.id), ["A1", "B2"]);
  await assert.rejects(collect(fake, "/api/items", 1), /page budget/);
  await assert.rejects(collect(async () => ({ok: false, status: 503}), "/api/items"), /503/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [], next: "/api/items"})})), /pagination cycle/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [], next: "https://invalid.example/"})})), /untrusted next URL/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [{id: "A1", label: "x"}, {id: "A1", label: "y"}], next: null})})),
    /duplicate item id/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [{id: "A1", label: 42}], next: null})})), /invalid item/);
  console.log("PASS: two pages, six failures, no network");
}
test().catch(error => {console.error(error); process.exitCode = 1;});
~~~

### Πού βρίσκεται το όριο εμπιστοσύνης
Μια απάντηση διακομιστή δεν είναι αυτομάτως αξιόπιστη: μπορεί να περιέχει λάθος τύπους, διπλά IDs ή παραπλανητική διεύθυνση επόμενης σελίδας. Η λίστα επιτρεπόμενων διαδρομών ελέγχεται πριν κληθεί η fetchPage. Το σύνολο visited εντοπίζει επαναλαμβανόμενες σελίδες, ενώ το maxPages σταματά και μια ατελείωτη ακολουθία διαφορετικών cursors. Αν αποτύχει μεταγενέστερη σελίδα, απορρίπτεται ολόκληρο το αποτέλεσμα. Αυτό δεν αναιρεί τυχόν παρενέργειες ενός πραγματικού μηχανισμού μεταφοράς.

Η ετικέτα του πρώτου αντικειμένου μοιάζει επίτηδες με HTML. Στον φυλλομετρητή εμφάνισέ την ως κείμενο με element.textContent = item.label, όχι με innerHTML που ερμηνεύει μη έμπιστο περιεχόμενο. Οι δοκιμές Node δεν αποδεικνύουν ασφάλεια του DOM· χρειάζεται ξεχωριστός έλεγχος στον browser. Η κανονική έκφραση των διαδρομών είναι σκόπιμα στενή και δεν αποτελεί γενικό αναλυτή URL.

### Συγκεκριμένη διάγνωση
1. Μείωσε το maxPages σε 1. Εξήγησε γιατί δεν επιτρέπεται να επιστραφεί μόνο η πρώτη, παρότι έγκυρη, σελίδα.
2. Κάνε τη δεύτερη σελίδα να δείχνει ξανά στο /api/items. Βρες την επανάληψη όπου ανιχνεύεται ο κύκλος.
3. Προσομοίωσε HTTP 503 και μετά απάντηση με items: null. Σύγκρινε τα μηνύματα σφάλματος δικτύου και σχήματος.
4. Βάλε ίδιο αναγνωριστικό σε δύο διαφορετικές σελίδες. Βεβαιώσου ότι απορρίπτεται ολόκληρη η Promise.
5. Δώσε ως next απόλυτη ή σχετική προς πρωτόκολλο διεύθυνση. Μέτρησε ότι δεν γίνεται κλήση μεταφοράς προς αυτή.

### Επόμενο εργαστήριο
Πρόσθεσε ακύρωση με AbortController και χρονικό όριο ανά αίτημα σε πραγματικό προσαρμογέα fetch. Δοκίμασέ τα σε τοπικό HTTP server που κλείνει μετά από κάθε δοκιμή. Έπειτα κατασκεύασε προσβάσιμη λίστα αποτελεσμάτων με textContent, εστίαση πληκτρολογίου και περιοχή αναγγελίας σφαλμάτων. Έλεγξε την εμφάνιση σε κινητό και υπολογιστή. Κατάγραψε χωριστά την έκδοση Node, τις απορρίψεις και τις παρατηρήσεις του browser: οι δοκιμές Node δεν υποκαθιστούν τις δοκιμές οθόνης.

## JavaScript — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Τα let και const έχουν εμβέλεια μπλοκ, ενώ το var εμβέλεια συνάρτησης· το const δεν παγώνει αντικείμενα.
2. Τα promises λειτουργούν με τον event loop· χειρίσου απορρίψεις και παλιές ασύγχρονες απαντήσεις.
3. Χρησιμοποίησε textContent για μη έμπιστο κείμενο αντί για ανεξέλεγκτο innerHTML.
