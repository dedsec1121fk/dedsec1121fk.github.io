# Ασφαλής ενημέρωση Git branch

## Τι συμβαίνει
Ξεκίνα με git status και δες αν έχεις αλλαγές χωρίς commit. Το pull ή rebase μπορεί να αποτύχει επειδή τα ιστορικά διαφέρουν, όχι επειδή λείπουν αρχεία.

## Πρακτικός έλεγχος
Προτίμησε merge σε συνεργατικό branch εκτός αν έχει συμφωνηθεί επανεγγραφή τοπικών commits. Ποτέ force push σε κοινό ιστορικό μόνο για να παρακάμψεις conflict.

## Συνήθεις παγίδες
Επαλήθευσε HEAD, ιστορικό και tests πριν από release. Αν conflict παραμένει, σταμάτα αντί να διαγράψεις αυθαίρετα τη μία πλευρά.

## Μικρό παράδειγμα για προσαρμογή
```text
git status --short && git log --oneline -5
```

## Εξέτασε divergence πριν διαλέξεις πολιτική integration
~~~sh
git fetch origin
git log --oneline --left-right HEAD...origin/main
git diff --stat HEAD..origin/main
~~~
Το fetch ενημερώνει remote-tracking στοιχεία χωρίς merge στο working tree. Η three-dot σύγκριση ιστορικού δείχνει commits που ανήκουν μόνο στη μία πλευρά, ενώ το two-dot diff συγκρίνει endpoint trees. Χρησιμοποίησε το πραγματικό όνομα branch και όχι υποχρεωτικά main.

Με απαίτηση fast-forward, το `git pull --ff-only` αρνείται divergent ιστορικό. Η άρνηση είναι προστασία και όχι άδεια διαγραφής commits με reset. Το merge διατηρεί ancestry, ενώ το rebase αναπαράγει αλλαγές σε νέα commits με διαφορετικά IDs. Σε conflict δες την ενεργή operation και το αντίστοιχο abort αν χρειάζεται επιστροφή. Εξασκήσου σε throwaway clone πριν πειράξεις κοινή εργασία.

Πηγή: [git pull](https://git-scm.com/docs/git-pull).
