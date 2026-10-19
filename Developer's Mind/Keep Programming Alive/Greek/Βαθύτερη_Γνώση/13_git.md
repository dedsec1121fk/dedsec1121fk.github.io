# Ιστορικό Git — έλεγχος προγόνων πριν από ασφαλή ενημέρωση

## Σενάριο και κριτήρια επιτυχίας
Δημιούργησε δύο commits μέσα σε προσωρινό αποθετήριο και απόδειξε ότι το πρώτο είναι πρόγονος του δεύτερου. Η αντίστροφη σύγκριση πρέπει να αποτυγχάνει. Η καθαρή κατάσταση εργασίας είναι ξεχωριστή απαίτηση. Δεν ορίζεται απομακρυσμένο αποθετήριο και καμία εντολή δεν επηρεάζει τα πραγματικά αρχεία του έργου.

## Εκτελέσιμο εργαστήριο
Αποθήκευσε ως `13_git.py` και εκτέλεσε με Python 3 και την ενσωματωμένη βιβλιοθήκη. Τα δεδομένα είναι τεχνητά, χωρίς πρόσβαση σε προσωπικά αρχεία ή δίκτυο.

~~~python
import os, pathlib, subprocess, tempfile
def git(cwd, *args):
    return subprocess.run(["git","-C",str(cwd),*args], check=True,
                          capture_output=True, text=True).stdout.strip()
with tempfile.TemporaryDirectory() as folder:
    path = pathlib.Path(folder)
    git(path, "init", "-q")
    git(path, "config", "user.name", "Fixture")
    git(path, "config", "user.email", "fixture@example.invalid")
    (path/"lesson.md").write_text("one\n", encoding="utf-8")
    git(path, "add", "--", "lesson.md")
    git(path, "commit", "-qm", "first")
    base = git(path, "rev-parse", "HEAD")
    (path/"lesson.md").write_text("two\n", encoding="utf-8")
    git(path, "add", "--", "lesson.md")
    git(path, "commit", "-qm", "second")
    latest = git(path, "rev-parse", "HEAD")
    assert base != latest
    assert subprocess.run(["git","-C",str(path),"merge-base",
                           "--is-ancestor",base,latest]).returncode == 0
    assert subprocess.run(["git","-C",str(path),"merge-base",
                           "--is-ancestor",latest,base]).returncode == 1
    assert git(path, "status", "--porcelain") == ""
print("PASS disposable Git ancestry checks")
~~~

## Τεχνική ερμηνεία
Για ασφαλή ενημέρωση κοινόχρηστου κλάδου χρειάζεται η *τρέχουσα* απομακρυσμένη κορυφή, όχι αυτή που είδαμε αρκετά λεπτά πριν. Μετά το fetch εξέτασε τις νέες αλλαγές και επέτρεψε ενημέρωση μόνο όταν η αναμενόμενη βάση εξακολουθεί να ισχύει. Η `git merge-base --is-ancestor old new` ελέγχει τη σχέση ιστορικού, αλλά δεν εμποδίζει από μόνη της έναν άλλο χρήστη να προωθήσει αλλαγές ταυτόχρονα. Μη χρησιμοποιείς force push για να παρακάμψεις απόρριψη· συγχώνευσε συνειδητά ταυτόχρονες αλλαγές.

## Περιορισμένες δοκιμές
Πρόσθεσε τρίτο commit και έλεγξε όλες τις σειρές προγόνων. Άλλαξε ένα αρχείο χωρίς commit και δες τι εμφανίζει η `git status --porcelain`. Δημιούργησε χωριστό ιστορικό σε νέο προσωρινό κατάλογο και έλεγξε ότι δεν θεωρείται πρόγονος. Τρέξε `git diff --check` πριν πραγματική καταχώριση για να εντοπίσεις προβλήματα μορφοποίησης.

## Διάγνωση
Αν απορριφθεί η ενημέρωση, μην επιβάλεις την παλιά κορυφή ούτε να διαγράψεις αθέλητα την εργασία άλλων. Κάνε fetch, έλεγξε τα αρχεία που άλλαξαν και δώσε ιδιαίτερη προσοχή στις αντιστοιχίσεις Markdown με website overlays. Μη βάζεις μυστικά σε commits. Απαιτείται το εκτελέσιμο Git.
