# Αποτυχία Git clone σε Termux: διεύθυνση, πρόσβαση ή δίκτυο

## Γιατί συμβαίνει
Το Git clone μπορεί να αποτύχει λόγω λάθος URL, DNS/TLS, έλλειψης δικαιωμάτων, ιδιωτικού repository ή ανεπαρκούς χώρου. Παρόμοια μηνύματα απαιτούν διαφορετικές λύσεις. Μην βάζεις access tokens σε clone URLs, shell history, screenshots ή δημόσια bug reports.

## Ελεγχόμενες εντολές διάγνωσης

~~~sh
git --version
git remote -v  # only inside an existing repository
git ls-remote https://github.com/OWNER/REPO.git HEAD
df -h "$HOME"
# For SSH, inspect the configured identity WITHOUT printing key content:
# ssh -T git@github.com
~~~

## Ασφαλής πορεία διόρθωσης
Έλεγξε owner/repository από εξουσιοδοτημένο browser. Αν το URL είναι σωστό και private, δες δικαιώματα του συγκεκριμένου λογαριασμού, token ή SSH key. Χρησιμοποίησε credential helper ή ασφαλή SSH ρύθμιση· ποτέ απενεργοποίηση TLS. Δοκίμασε ξεχωριστά δίκτυο και εξουσιοδότηση. Σε κινητό με λίγο χώρο απέφυγε επαναλαμβανόμενα πλήρη clones.

## Πρακτικό εργαστήριο
Σύγκρινε git ls-remote για γνωστό public repository και σκόπιμα ανύπαρκτη διαδρομή. Κατάταξε τις αποτυχίες χωρίς να υποθέτεις ότι private repos δεν υπάρχουν. Επανάλαβε με Wi-Fi/mobile data μόνο αν γνωρίζεις τις χρεώσεις και τις άδειες.
