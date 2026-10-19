# JavaScript Uncaught TypeError — έλεγξε τη λειτουργία που απέτυχε

## Διάβασε το μήνυμα
Το TypeError εμφανίζεται όταν μια τιμή χρησιμοποιείται ασύμβατα: καλείς κάτι που δεν είναι function, κάνεις destructure null ή εφαρμόζεις array method σε μη-array. Το Uncaught σημαίνει ότι δεν υπήρξε κατάλληλος handler.

~~~javascript
function average(values) {
  if (!Array.isArray(values)) throw new TypeError("expected array");
  if (!values.every(v => Number.isFinite(v))) throw new TypeError("non-finite number");
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
console.assert(average([2,4]) === 3);
console.assert(average([]) === null);
try { average({length:2}); throw Error("test failed"); }
catch (e) { if (!(e instanceof TypeError)) throw e; }
~~~

## Βρες ποιος παρήγαγε την τιμή
Δες το stack frame του δικού σου κώδικα. Χρησιμοποίησε typeof, Array.isArray και validation στο API boundary. Το optional chaining είναι σωστό όταν επιτρέπεται απουσία, όχι όταν ένα API υπόσχεται υποχρεωτικά array.

## Browser debugging
Ενεργοποίησε pause on exceptions στα DevTools και έλεγξε το πραγματικό argument χωρίς να γράφεις secrets στο console. Αν πρόκειται για rejected Promise, χρειάζεται async error handler. Ένα try/catch γύρω από μη awaited κλήση δεν αρκεί.

**Άσκηση:** δώσε undefined, null και string στην average· πρέπει να απορριφθούν πριν εκτελεστεί reduce. Πηγή: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError

## Έλεγχος τιμής στο σημείο εισόδου
~~~js
function upperName(user) {
  if (!user || typeof user.name !== "string")
    throw new TypeError("user.name must be a string");
  return user.name.toUpperCase();
}
console.assert(upperName({name:"Ada"}) === "ADA");
~~~
Δοκίμασε ανεξάρτητα `null`, `{}` και `{name:42}`. Κάθε ένα παραβιάζει τη σύμβαση εισόδου για διαφορετικό λόγο. Μην βάζεις ένα τεράστιο `try/catch` γύρω από ολόκληρη την εφαρμογή: έλεγξε τα εξωτερικά δεδομένα στο συγκεκριμένο όριο όπου μπαίνουν. Αν το TypeError συμβαίνει μέσα σε Promise, πρέπει να αντιμετωπιστεί επιπλέον το rejected Promise και όχι απλώς μια synchronous εξαίρεση.
