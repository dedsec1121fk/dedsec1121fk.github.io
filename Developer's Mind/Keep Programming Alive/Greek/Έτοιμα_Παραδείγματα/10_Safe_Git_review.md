# Συνταγή: έλεγχος αλλαγών Git χωρίς μεταβολές στο πραγματικό έργο

## Πότε χρησιμοποιείται και τι πρέπει να επιτύχει
Κατά τον έλεγχο ενημέρωσης έργου, δημιούργησε μία καθαρή αρχική κατάσταση σε προσωρινό αποθετήριο, άλλαξε ένα αρχείο και χρησιμοποίησε εντολές μόνο ανάγνωσης για να εξετάσεις διαδρομή και διαφορά. Έτσι ξεχωρίζεις τροποποιήσεις του χώρου εργασίας από καταχωρισμένο ιστορικό. Οι εντολές εγγραφής του παραδείγματος δημιουργούν μόνο την προσωρινή δοκιμή· οι εντολές επιθεώρησης δεν κάνουν stage, commit ή push.

## Πλήρες εκτελέσιμο παράδειγμα
Αποθήκευσε ως `10_Safe_Git_review.py` και εκτέλεσε με Python 3. Χρησιμοποιούνται προσωρινά δεδομένα και δεν απαιτείται δίκτυο.

~~~python
import pathlib, subprocess, tempfile
def git(root,*args):
    return subprocess.run(["git","-C",str(root),*args],check=True,
                          capture_output=True,text=True).stdout
with tempfile.TemporaryDirectory() as directory:
    root = pathlib.Path(directory)
    git(root,"init","-q")
    git(root,"config","user.name","Review Fixture")
    git(root,"config","user.email","review@example.invalid")
    (root/"note.txt").write_text("baseline\n")
    git(root,"add","--","note.txt")
    git(root,"commit","-qm","baseline")
    assert git(root,"status","--porcelain=v1").strip() == ""
    (root/"note.txt").write_text("edited\n")
    lines = git(root,"status","--porcelain=v1").splitlines()
    assert any(line.startswith(" M ") for line in lines)
    assert "edited" in git(root,"diff","--","note.txt")
    assert git(root,"diff","--check") == ""
print("PASS read-only Git review after disposable setup")
~~~

## Εγγυήσεις και περιορισμοί
Η `git status --porcelain=v1` παράγει σταθερή σύντομη κατάσταση κατάλληλη για επεξεργασία. Κενό και M στην αρχή δείχνουν αλλαγή στον χώρο εργασίας που δεν έχει προστεθεί στο staging. Η `git diff -- note.txt` δείχνει διαφορά συγκεκριμένου αρχείου και η `git diff --check` εντοπίζει προβλήματα κενών σε μη καταχωρισμένες αλλαγές. Αυτοί οι έλεγχοι δεν αποδεικνύουν ότι το απομακρυσμένο main έμεινε σταθερό· χρειάζεται fetch και σύγκριση της τρέχουσας κορυφής.

## Εργαστήριο προσαρμογής
Πρόσθεσε το αρχείο στο staging και σύγκρινε git diff με git diff --cached. Δημιούργησε μη παρακολουθούμενο αρχείο και παρατήρησε την ένδειξη porcelain. Επανέφερε μόνο τα προσωρινά δεδομένα και βεβαιώσου ότι η κατάσταση είναι καθαρή. Σε δεύτερο δοκιμαστικό κλάδο μελέτησε τις αλλαγές άλλου συντάκτη πριν από ενημέρωση fast-forward.

## Αντιμετώπιση προβλημάτων
Αν η git diff είναι κενή αλλά υπάρχει αλλαγή στο staging, εξέτασε git diff --cached. Αν ένα αρχείο αγνοείται, χρησιμοποίησε `git check-ignore -v` για να βρεις τον κανόνα. Μη χρησιμοποιείς reset --hard, clean -fd ή force push για να αποφύγεις τη σωστή επιθεώρηση ενός άγνωστου αποθετηρίου.
