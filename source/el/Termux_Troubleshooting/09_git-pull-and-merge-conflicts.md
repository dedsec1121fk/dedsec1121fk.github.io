# Git pull σε Termux: κράτησε αλλαγές πριν συγχωνεύσεις ιστορικό

## Γιατί συμβαίνει
Το git pull συνδυάζει fetch με merge ή rebase, ανάλογα με τις ρυθμίσεις. Μπορεί να σταματήσει λόγω τροποποιημένων tracked αρχείων, αποκλίνοντος ιστορικού ή conflict που απαιτεί απόφαση. Ένα non-fast-forward push αφορά την προέλευση των commits· δεν λύνεται διαγράφοντας το .git. Στόχος είναι να κρατήσεις τοπικές αλλαγές και νέα απομακρυσμένα commits.

## Ελεγχόμενες εντολές διάγνωσης

~~~sh
git status --short --branch
git branch --show-current
git fetch origin
git log --oneline --graph --decorate --all -n 20
git diff --check
# After reviewing, choose merge or rebase deliberately:
# git merge origin/main
# Inspect conflicts, resolve each, git add, git commit.
~~~

## Ασφαλής πορεία διόρθωσης
Πριν από merge δημιούργησε backup branch και αποθήκευσε συνειδητά τοπικές αλλαγές με commit ή stash. Δες αν οι δύο πλευρές άλλαξαν τις ίδιες γραμμές. Μη διαλέγεις μαζικά ours/theirs χωρίς να καταλαβαίνεις το context, ειδικά σε rebase. Σε ενεργό merge το git merge --abort προσπαθεί να επαναφέρει την προηγούμενη κατάσταση. Το reflog βοηθά, αλλά δεν είναι backup.

## Πρακτικό εργαστήριο
Φτιάξε δύο αναλώσιμα clones από τοπικό bare repository, άλλαξε την ίδια γραμμή και δοκίμασε pull. Επίλυσε το conflict διατηρώντας το σωστό κοινό νόημα. Έλεγξε git log --graph και project tests πριν από push· ποτέ force-push σε κοινό main για το εργαστήριο.
