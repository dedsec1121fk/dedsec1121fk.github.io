# Git: ιστορικό, ασφαλείς αλλαγές και επαναφορά

## Git και ασφαλές ιστορικό αλλαγών

Δημιούργησε κλάδο ή τοπικό αντίγραφο πριν από σημαντικές αλλαγές. Έλεγξε git diff και git status· μην αλλάζεις το επίσημο origin. Το reset --hard είναι επικίνδυνο όταν υπάρχουν μη αποθηκευμένες αλλαγές.

### Λυμένο παράδειγμα

```text
git status --short
git remote -v
git diff --check
git log -5 --oneline
```

### Άσκηση

Εξήγησε τη διαφορά git fetch και git pull.

### Λύση / υπόδειξη

Το fetch λαμβάνει δεδομένα· το pull επιχειρεί και ενσωμάτωση.

### Αναίρεση χωρίς διαγραφή ιστορικού

~~~sh
mkdir git-scratch && cd git-scratch
git init -b main
printf 'first\n' > note.txt
git add note.txt
git diff --cached --check
git commit -m "Record baseline"
printf 'second\n' >> note.txt
git diff -- note.txt
git status --short
~~~

Αν ζητηθεί, δήλωσε τοπικό author identity. Το `git diff` δείχνει μη staged αλλαγές ενώ το `git diff --cached` δείχνει staged. Κάνε δεύτερο commit, έλεγξε `git log --oneline` και τρέξε `git revert <second-commit-sha>` ώστε να προστεθεί νέο commit αναίρεσης. Η `reset --hard` μπορεί να καταστρέψει μη δεσμευμένη tracked εργασία και δεν είναι ασφαλής αυτόματη λύση στον κοινό `main`. Κάθε απόδειξη επιτυχίας πρέπει να αναφέρεται στο συγκεκριμένο commit SHA: το push δεν αποδεικνύει ότι περνούν δοκιμές browser. Πηγή: https://git-scm.com/docs

## Ιστορικό Git, κλάδοι, συγκρούσεις και επαναφορά

Κάθε commit αποθηκεύει στιγμιότυπο και σχέση προγόνων. Οι κλάδοι είναι αναφορές που κινούνται. Το merge συνδυάζει ιστορικά ενώ το rebase επαναγράφει την τοπική ακολουθία commit. Απόφυγε την εξαναγκασμένη αποστολή σε κοινόχρηστο κλάδο.

### Ασφαλείς εντολές ελέγχου
```bash
git status --short
git remote -v
git log --oneline -5
git diff --check
git diff --stat
```
Η αποτυχία `non-fast-forward` σημαίνει ότι το νέο commit δεν προχωρά απλώς την απομακρυσμένη αναφορά. Κάνε fetch, εξέτασε τις αλλαγές και συμφιλίωσε το ιστορικό αντί να χρησιμοποιήσεις απερίσκεπτα `--force`.

### Ασκήσεις
1. Δημιούργησε κλάδο και επίλυσε δοκιμαστική σύγκρουση.
2. Σύγκρινε `git revert` και `git reset --hard`.
3. Δοκίμασε ανάκτηση τοπικού commit με reflog.

## git: not a git repository

### Ερμηνεία και διαφορική διάγνωση
Το Git δεν βρίσκει μεταδεδομένα repository στον τρέχοντα φάκελο ή στους γονικούς. Ίσως βρίσκεσαι σε λάθος κατάλογο, αντέγραψες τα αρχεία χωρίς τον κρυφό .git ή το script άλλαξε working directory. Μην εκτελείς αμέσως git init: δημιουργεί νέο, άσχετο ιστορικό.

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
~~~sh
pwd
git rev-parse --show-toplevel
git rev-parse --git-dir
git status --short
# If outside a repository, commands above fail by design.
# Inspect the intended folder before changing it:
ls -la /path/to/project
git -C /path/to/project rev-parse --show-toplevel
~~~

### Ερμηνεία αποτελεσμάτων και διόρθωση
Κατέγραψε pwd στο ίδιο shell με την αποτυχία. Σε worktree το .git μπορεί να είναι αρχείο και όχι φάκελος. Αν λείπουν τα μεταδεδομένα, κράτησε πρώτα τα τοπικά αρχεία και μετά αξιολόγησε ανάκτηση από remote/backup. Στα scripts υπολόγισε διαδρομές από τη θέση του script και σταμάτα με σαφές μήνυμα.

### Πρακτικό εργαστήριο
Εκτέλεσε rev-parse σε απλό προσωρινό φάκελο και σε υπάρχον clone. Κατέγραψε exit status, stdout και stderr. Επιβεβαίωσε ότι η λύση δεν δημιουργεί δεύτερο .git μέσα σε πραγματικό repository.
