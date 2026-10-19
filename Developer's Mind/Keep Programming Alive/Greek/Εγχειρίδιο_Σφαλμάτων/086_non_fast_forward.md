# Git non-fast-forward — συμφιλίωση δύο ιστορικών χωρίς απώλειες

## Αναγνώριση του προβλήματος
Ένα κανονικό push στη main απορρίπτεται όταν το remote περιέχει commit που δεν είναι πρόγονος του τοπικού τελευταίου commit. Η προστασία αποτρέπει τη σιωπηρή απώλεια εργασίας άλλου συνεργάτη ή προηγούμενης συνεδρίας. Δεν σημαίνει ότι χάθηκε κώδικας ή ότι χρειάζεται αναγκαστικά force push. Σε έργο με ένα μόνο main branch, πρώτα ενημέρωσε τη γνώση για την απομακρυσμένη έκδοση και μετά διάλεξε τρόπο συμφιλίωσης.

## Πλήρες δοκιμαστικό σενάριο χωρίς δίκτυο
Αποθήκευσε ως reproduce.sh και εκτέλεσε sh reproduce.sh με εγκατεστημένο Git. Το πείραμα φτιάχνει τοπικό bare repository και δύο προσωρινά αντίγραφα alice και bob. Δεν χρησιμοποιεί πραγματικό GitHub, στοιχεία σύνδεσης ή κώδικα του έργου. Η Alice ανεβάζει αλλαγή, ο Bob προσπαθεί να ανεβάσει από παλαιότερο ιστορικό και βλέπει την αναμενόμενη απόρριψη. Με fetch και rebase διατηρούνται τα commits και μετά επιτυγχάνεται απλό push.

~~~sh
#!/usr/bin/env sh
set -eu
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
git init -q --bare "$work/remote.git"
git -C "$work/remote.git" symbolic-ref HEAD refs/heads/main
git init -q -b main "$work/seed"
git -C "$work/seed" config user.name 'Local Example'
git -C "$work/seed" config user.email 'example@invalid.test'
printf 'baseline\n' > "$work/seed/README.md"
git -C "$work/seed" add README.md
git -C "$work/seed" commit -qm 'seed'
git -C "$work/seed" remote add origin "$work/remote.git"
git -C "$work/seed" push -q -u origin main
git clone -q "$work/remote.git" "$work/alice"
git clone -q "$work/remote.git" "$work/bob"
for who in alice bob; do
  git -C "$work/$who" config user.name 'Local Example'
  git -C "$work/$who" config user.email 'example@invalid.test'
done
printf 'from Alice\n' > "$work/alice/alice.txt"
git -C "$work/alice" add alice.txt
git -C "$work/alice" commit -qm 'alice'
git -C "$work/alice" push -q origin main
printf 'from Bob\n' > "$work/bob/bob.txt"
git -C "$work/bob" add bob.txt
git -C "$work/bob" commit -qm 'bob'
if git -C "$work/bob" push -q origin main 2> "$work/rejection.log"; then
  echo 'FAIL: non-fast-forward unexpectedly accepted' >&2
  exit 1
fi
git -C "$work/bob" fetch -q origin main
git -C "$work/bob" rebase -q origin/main
git -C "$work/bob" push -q origin main
git -C "$work/remote.git" cat-file -e main:alice.txt
git -C "$work/remote.git" cat-file -e main:bob.txt
printf 'PASS: rejection observed; remote history preserved without force push\n'
~~~

## Προσεκτική διαδικασία σε πραγματικό έργο
Εκτέλεσε πρώτα git status και git fetch origin. Σύγκρινε git log --oneline HEAD..origin/main με git log --oneline origin/main..HEAD για να δεις τι υπάρχει αποκλειστικά σε κάθε πλευρά. Αν υπάρχουν μη αποθηκευμένες αλλαγές, κάνε commit ή ασφαλές stash πριν προχωρήσεις. Με git rebase origin/main επανεφαρμόζονται τα ανεξάρτητα τοπικά commits πάνω στη νέα κορυφή. Εναλλακτικά χρησιμοποίησε merge όπου η ομάδα θέλει ρητό ιστορικό συγχωνεύσεων. Επίλυσε συγκρούσεις, τρέξε τους επηρεαζόμενους ελέγχους και κάνε push χωρίς --force. Αν άλλαξε ξανά το remote, επανάλαβε τον έλεγχο. Το --force-with-lease επίσης απαιτεί κατανόηση του ιστορικού, γιατί μπορεί να χαθεί εργασία.

## Ασκήσεις με αποτυχία και επαλήθευση
1. Βρες ποιο commit υπάρχει μόνο στο ιστορικό της Alice μετά το πρώτο της push.
2. Άλλαξε την ίδια γραμμή README και στα δύο αντίγραφα, αναπαρήγαγε conflict κατά το rebase και επίλυσέ το μόνο στο προσωρινό repository.
3. Δες git log --graph --oneline --all μετά την επιτυχία και αιτιολόγησε τη νέα αλυσίδα προγόνων.
4. Αν έχουν ήδη δημοσιευτεί τα τοπικά commits, εξέτασε αν χρειάζεται ασφαλές merge αντί για επανεγγραφή ιστορικού. Μην κάνεις reset πραγματικής παραγωγικής main μόνο για να φύγει το μήνυμα.

**Παραδοτέα:** αναμενόμενη απόρριψη, επιτυχής συμφιλίωση και έλεγχος ότι τα alice.txt και bob.txt υπάρχουν στο απομακρυσμένο main.

**Τεκμηρίωση:** https://docs.github.com/en/get-started/using-git/dealing-with-non-fast-forward-errors
