# Αποτυχίες repositories Termux: mirror, DNS και package indexes

## Γιατί συμβαίνει
Μια αποτυχία apt/pkg στο Termux μπορεί να οφείλεται σε μη διαθέσιμο mirror, παλιό index, λάθος repository, πρόβλημα DNS ή TLS. Το 404 για πακέτο δεν αποδεικνύει ότι δεν υπήρξε ποτέ. Τα repositories του Termux είναι ειδικά για το περιβάλλον του· αυθαίρετα Ubuntu/Debian sources μπορεί να σπάσουν τη συμβατότητα.

## Ελεγχόμενες εντολές διάγνωσης

~~~sh
pkg --version
printf 'PREFIX=%s\n' "$PREFIX"
pkg update
# Inspect errors before deciding on a change.
command -v termux-change-repo
# Use termux-change-repo interactively to select a supported mirror.
# Then rerun: pkg update && pkg upgrade
~~~

## Ασφαλής πορεία διόρθωσης
Κράτησε την πρώτη προβληματική διεύθυνση και το σφάλμα DNS/TLS, χωρίς secrets. Αν είναι προσωρινή αποτυχία, επανέλαβε μετά από λογική αναμονή. Αν το mirror δεν λειτουργεί, διάλεξε υποστηριζόμενο mirror με termux-change-repo αντί για τυχαία URLs. Πριν από μεγάλο upgrade έλεγξε αποθηκευτικό χώρο και backup. Μην απενεργοποιείς επαλήθευση υπογραφών ή TLS.

## Πρακτικό εργαστήριο
Με δικό σου τοπικό HTTP fixture σύγκρινε DNS που λειτουργεί αλλά URL που επιστρέφει 404, με αποτυχία επίλυσης hostname. Κατέγραψε τις διαφορές. Σε πραγματικό Termux εξέτασε την ημερομηνία των package indexes πριν αλλάξεις mirror.
