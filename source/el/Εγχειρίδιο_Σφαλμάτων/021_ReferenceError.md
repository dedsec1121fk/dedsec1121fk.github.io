# JavaScript ReferenceError — άγνωστο όνομα και temporal dead zone

## Δύο αιτίες
Μια μεταβλητή που δεν δηλώθηκε ποτέ διαφέρει από let/const binding που υπάρχει αλλά δεν έχει αρχικοποιηθεί. Και τα δύο μπορούν να δώσουν ReferenceError· το δεύτερο είναι temporal dead zone.

~~~javascript
try {
  console.log(neverDeclared);
} catch (err) {
  console.assert(err instanceof ReferenceError);
}

function normalized(text) {
  const value = String(text).trim();
  return value.toLowerCase();
}
console.assert(normalized(" Ada ") === "ada");
~~~

## Παγίδα του scope
Το επόμενο είναι εσκεμμένα λάθος:

~~~javascript
// console.log(status); // ReferenceError πριν initialization
// const status = "ready";
~~~

Μετέφερε τις δηλώσεις πριν από την πρώτη χρήση και πρόσεξε το shadowing μέσα σε nested block. Το typeof ενός πραγματικά αδήλωτου ονόματος μπορεί να δώσει "undefined", αλλά για lexical binding σε TDZ μπορεί να πετάξει exception.

## Άσκηση
Φτιάξε module που κάνει export τη normalized() και κάνε import με το ακριβές όνομα. Έπειτα άλλαξε ένα γράμμα και παρατήρησε το σφάλμα module. Ένα ανύπαρκτο identifier διαφέρει από property που λείπει από υπάρχον αντικείμενο. Διόρθωσε import/scope αντί να εγκαθιστάς τυχαία πακέτα.

Πηγή: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_lexical_declaration_before_init

## Άγνωστο όνομα ή temporal dead zone;
Στη JavaScript το `ReferenceError` έχει διαφορετικές αιτίες. Το `console.log(missingName)` αποτυγχάνει επειδή δεν υπάρχει binding. Το `console.log(value); let value = 2;` αποτυγχάνει επειδή η μεταβλητή υπάρχει στο lexical scope αλλά δεν έχει αρχικοποιηθεί ακόμη (temporal dead zone). Χτίσε δύο ξεχωριστά μικρά παραδείγματα και διόρθωσέ τα με σωστό όνομα ή σωστή σειρά αρχικοποίησης. Ένα `var` έχει διαφορετικούς κανόνες και μπορεί να δώσει `undefined` πριν από ανάθεση, κάτι που δεν αποτελεί γενικά καλή λύση. Απέφυγε να κάνεις κάθε μεταβλητή global απλώς για να εξαφανιστεί το error.
