# typescript — συγκεντρωτικός οδηγός

## TypeScript

**Συνήθης χρήση:** Γλώσσες διαδικτύου.

**Προτεινόμενη επέκταση αρχείου:** `.ts`.

**Εκτέλεση / περιβάλλον:** Μεταγλώττιση με tsc και εκτέλεση της JavaScript.

### Αρχικό παράδειγμα

```
function greet(name: string): string {
  return `Hello, ${name}!`;
}
console.log(greet("Ada"));
```

### Πώς διαβάζεται

Οι επισημάνσεις τύπων ελέγχονται πριν παραχθεί JavaScript.

### Συνηθισμένο λάθος

Οι επισημάνσεις τύπων ελέγχονται πριν παραχθεί JavaScript. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Οι τύποι δεν επικυρώνουν δεδομένα από server
Το TypeScript ελέγχει κώδικα κατά το build. Ένα `JSON.parse` δεν αποκτά ασφαλές σχήμα επειδή το δήλωσες interface. Επικύρωσε `unknown` στην είσοδο:
```typescript
type Task = { id: number; title: string };
function asTask(value: unknown): Task {
  if (typeof value !== "object" || value === null) throw Error("not object");
  const r = value as Record<string, unknown>;
  if (typeof r.id !== "number" || !Number.isInteger(r.id) ||
      typeof r.title !== "string") throw Error("invalid task");
  return { id: r.id, title: r.title };
}
```
Διαχώρισε αποτελέσματα με discriminated unions, π.χ. `kind:"ok"` ή `kind:"error"`, αντί για πολλά optional πεδία. Ενεργοποίησε `strict`, χρησιμοποίησε narrowing και απόφυγε `any` στα όρια. Το `as` δεν αποτελεί runtime απόδειξη.

**Άσκηση:** μοντελοποίησε loading/success/empty/error σε offline search και κάνε exhaustive `switch` με `never`. Πηγή: https://www.typescriptlang.org/docs/handbook/intro.html.

## TypeScript — Αναλυτικός οδηγός εξάσκησης

### Δύο διαφορετικές εγγυήσεις
Η TypeScript ελέγχει τον πηγαίο κώδικα, αλλά αφαιρεί τα annotations στη μεταγλώττιση. Δεν ελέγχει αυτόματα JSON από server. Αντιμετώπισε εξωτερικές τιμές ως unknown και χρησιμοποίησε runtime validation.

### Εκτέλεση
Αποθήκευσε state.ts και τρέξε tsc --strict --target es2020 state.ts && node state.js με εγκατεστημένη TypeScript. Περιμένεις 4.

~~~typescript
type State =
  | { kind: "loading" }
  | { kind: "ready"; count: number }
  | { kind: "error"; reason: string };
function countFromNetwork(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < 0)
    throw Error("invalid count");
  return raw;
}
function label(s: State): string {
  switch (s.kind) {
    case "loading": return "Loading";
    case "ready": return String(s.count);
    case "error": return s.reason;
    default: {
      const unreachable: never = s;
      return unreachable;
    }
  }
}
console.log(label({ kind: "ready", count: countFromNetwork(4) }));
~~~

### Εσκεμμένο σφάλμα compiler
Πρόσθεσε μέλος {kind:"empty"} στον τύπο State χωρίς νέα περίπτωση στο switch. Η ανάθεση σε never πρέπει να αποτύχει κατά τη μεταγλώττιση. Έτσι αποδεικνύεις ότι μια περίπτωση λείπει. Έπειτα πρόσθεσέ την. Το τεστ του compiler διαφέρει από τον έλεγχο πραγματικών δεδομένων.

### Έλεγχοι εισόδου
Κάλεσε countFromNetwork με NaN, 3.5, -1, null και "4": όλες οι τιμές πρέπει να απορριφθούν. Η εντολή as δεν μετατρέπει JSON σε έγκυρο αντικείμενο. Σε εφαρμογή UI δήλωσε ρητά τις καταστάσεις loading και error αντί να χρησιμοποιείς ένα ασαφές undefined.

### Διάγνωση
TS2322: τύπος που δεν ταιριάζει. TS2339: ιδιότητα χωρίς κατάλληλη απόδειξη. Απόφυγε το any όταν έρχονται εξωτερικά δεδομένα. Browser εκτελεί το μεταγλωττισμένο JavaScript, όχι TypeScript με annotations.
Επιτυχία: αποτυχία compiler στη νέα περίπτωση και απόρριψη πέντε κακών τιμών. https://www.typescriptlang.org/docs/handbook/2/narrowing.html

## TypeScript — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `npx tsc --strict {file} && node {base}.js`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## TypeScript — Διαδρομή ουσιαστικής εξάσκησης

### Είσοδος από όριο εμπιστοσύνης
Η TypeScript ελέγχει προγράμματα στη μεταγλώττιση αλλά τα δεδομένα του HTTP παραμένουν ανεξέλεγκτα. Μην κάνεις απλώς JSON.parse(raw) as User: το as δεν επικυρώνει κανένα πεδίο σε runtime.

~~~typescript
type User = { id: number; name: string };
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return Number.isInteger(row.id) &&
    typeof row.name === "string" && row.name.trim().length > 0;
}
function parseUser(raw: string): User {
  const value: unknown = JSON.parse(raw);
  if (!isUser(value)) throw new Error("Invalid user payload");
  return value;
}
console.log(parseUser('{"id":4,"name":"Ada"}'));
~~~

Η type guard φέρει ευθύνη ορθότητας: ο compiler εμπιστεύεται το predicate και δεν μπορεί να εξακριβώσει ότι καλύπτει όλες τις επιχειρησιακές προϋποθέσεις. Η συνθήκη Number.isInteger δέχεται και αρνητικούς αριθμούς, άρα ένα θετικό id χρειάζεται επιπλέον έλεγχο.

### Αποτυχίες από δύο διαφορετικές πηγές
Δοκίμασε null, αντικείμενο με id ως string, αντικείμενο με κενό name και απολύτως άκυρο JSON. Τα τρία πρώτα είναι πιθανά validation failures, ενώ το τελευταίο προκαλεί SyntaxError στο JSON.parse προτού εκτελεστεί το isUser. Η UI οφείλει να διακρίνει αυτά τα σφάλματα χωρίς να εκθέτει μη ασφαλή δεδομένα του server.

### Ασφαλής εμφάνιση
Για DOM παρουσίαση το user.name περνά σε textContent, όχι σε innerHTML. Οι τύποι δεν είναι προστασία απέναντι σε HTML injection. Για πραγματικά requests χρειάζεται επίσης σωστό authorization server-side, unabhängig από το frontend build και τη χρήση TypeScript.

### Εργαστήριο αποδοχής
Με strict compiler options, καταχώρισε ξεχωριστά τις διαγνωστικές compile errors και τις runtime απορρίψεις. Γράψε τουλάχιστον πέντε tests και ένα αντιπαράδειγμα όπου το static cast δέχεται τιμή που η εφαρμογή πρέπει να απορρίψει. Τεκμηρίωσε ποια ιδιότητα ελέγχει κάθε predicate και ποια μένει εκτός scope.

## TypeScript — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Οι τύποι ελέγχονται στη μεταγλώττιση και συνήθως αφαιρούνται από το τελικό JavaScript.
2. Έλεγξε μια τιμή unknown πριν χρησιμοποιήσεις πεδία· το type assertion δεν κάνει πραγματική επικύρωση.
3. Χρησιμοποίησε διακριτές ενώσεις τύπων και εξαντλητικό έλεγχο περιπτώσεων.
## Επικύρωση άγνωστου JSON πριν τον περιορισμό τύπου

Η δήλωση τύπου TypeScript αφαιρείται κατά την εκτέλεση. Η διαβεβαίωση ότι JSON είναι User δεν ελέγχει απαιτούμενα πεδία. Δέξου εξωτερικά δεδομένα ως unknown και περιόρισε με πραγματικούς ελέγχους. Όρισε άγνωστα πεδία, κενές συμβολοσειρές και αν αριθμοί πρέπει να είναι πεπερασμένοι ακέραιοι.

Ο type guard πρέπει να εκφράζει ακριβώς όσα αποδεικνύει. Έλεγχος μόνο ύπαρξης id δεν δικαιολογεί πλήρες προφίλ με εμφωλευμένες προτιμήσεις. Κράτησε μικρό μοντέλο ορίου και μετέτρεψέ το σε εσωτερικά αντικείμενα μετά την επικύρωση.

```typescript
type Item = { id: number; name: string };
function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "number" && Number.isSafeInteger(row.id) && row.id > 0 &&
         typeof row.name === "string" && row.name.length > 0;
}
if (isItem({id: "7", name: "fixture"})) throw Error("string ID accepted");
if (!isItem({id: 7, name: "fixture"})) throw Error("valid item rejected");
```

Μεταγλώττισε με τη δική σου ρύθμιση TypeScript και εκτέλεσε την παραγόμενη JavaScript. Δοκίμασε null, πίνακες, κλασματικά ID και εμφωλευμένα αντικείμενα. Ο guard επιτρέπει επιπλέον ιδιότητες· άλλαξε ρητά την πολιτική για ακριβές σχήμα. Απόφυγε ανεξέλεγκτο spread μη έμπιστου αντικειμένου σε προνομιούχες ρυθμίσεις.

[Τεχνική αναφορά](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
