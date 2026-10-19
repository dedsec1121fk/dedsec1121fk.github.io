# Γραφήματα JavaScript: στατικά imports έναντι δυναμικής φόρτωσης

## Μοντέλο και όρια συμπερασμάτων
Για να καταλάβεις άγνωστο JavaScript project με άδεια εξέτασης, ξεκίνα από το entrypoint και χαρτογράφησε imports. Το στατικό ESM import δηλώνει εξαρτήσεις, ενώ import(), require(), workers και script tags προσθέτουν άλλους τρόπους φόρτωσης. Ένα regex βοηθά ως αρχικό heuristic αλλά δεν υποκαθιστά πλήρη JavaScript parser.

## Αυτοτελές δοκιμαστικό δείγμα
~~~javascript
// Own toy modules; place all three files in one temporary folder.
// api.mjs: export const getValue = () => 7;
// view.mjs: export { getValue } from "./api.mjs";
// main.mjs:
import { getValue } from "./view.mjs";
if (getValue() !== 7) throw Error("unexpected value");
console.log("entry -> view -> api");
~~~

## Βήματα έρευνας και ελέγχου
Για κάθε module σημείωσε διαδρομή, direct/dynamic imports, exports και side effects. Τα npm package names δεν επιλύονται όπως τα relative paths. Έλεγξε το πραγματικό bundler και χρησιμοποίησε parser ή graph output αντί να εκτελείς άγνωστες dependencies. Οι κύκλοι έχουν σημασία: ένα export ίσως δεν έχει αρχικοποιηθεί στο σημείο χρήσης.

## Πρακτικό εργαστήριο
Δημιούργησε τα τρία αρχεία και εκτέλεσε node main.mjs. Πρόσθεσε μη χρησιμοποιούμενο module και επιβεβαίωσε ότι δεν είναι dependency. Έπειτα φτιάξε κυκλική εξάρτηση σε δοκιμαστικά modules και διαχώρισε τη σύνδεση στο graph από τη σωστή αρχικοποίηση.

## Χάρτης imports με στατικές και δυναμικές ακμές
Σχεδίασε μικρό γράφημα `main.mjs → parser.mjs` και `parser.mjs → tokens.mjs`. Πρόσθεσε προαιρετικό `await import("./optional.mjs")` πίσω από boolean flag. Η στατική ανάγνωση δείχνει ότι η ακμή **υπάρχει ως δυνατότητα**, αλλά με flag `false` το module δεν φορτώνεται εκείνη την εκτέλεση. Σύγκρινε τρεις έννοιες: προσβάσιμος κώδικας, module που φορτώθηκε, συνάρτηση που πράγματι εκτελέστηκε. Σε bundled frontend το όνομα ενός chunk δεν αντιστοιχεί πάντα σε μία πηγή· δες build manifests ή source maps μόνο για έργα που έχεις δικαίωμα να αναλύσεις. Σε κύκλο imports έλεγξε και την αρχικοποίηση των bindings.
