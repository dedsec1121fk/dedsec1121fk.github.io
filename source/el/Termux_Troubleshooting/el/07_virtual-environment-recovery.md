# Ανάκτηση Python venv μετά από μεταφορά ή αναβάθμιση

## Αιτία και συμπτώματα
Τα Python virtual environments συχνά αποθηκεύουν απόλυτες διαδρομές interpreter και δεν είναι φορητά ανάμεσα σε συσκευές ή μεγάλες αλλαγές Python. Ένα ενεργοποιημένο venv μπορεί ακόμη να μην είναι αυτό που εκτελεί η εφαρμογή λόγω PATH. Κράτησε requirements και source code χωριστά από τον αναλώσιμο φάκελο venv.

## Αναπαραγωγή / διαγνωστικές εντολές
Εκτέλεσε σε δικό σου δοκιμαστικό περιβάλλον και έλεγξε τις διαδρομές πριν αλλάξεις αρχεία.
~~~sh
python -c 'import sys; print(sys.executable)'
python -m pip --version
python -m venv "$HOME/venv-lab"
. "$HOME/venv-lab/bin/activate"
python -c 'import sys; print(sys.prefix, sys.base_prefix)'
deactivate
# Never overwrite the only copy of dependency specifications.
~~~

## Επίλυση με βάση τα στοιχεία
Αν η διαδρομή interpreter δεν υπάρχει ή η ενεργοποίηση είναι ασυνεπής, ανέκτησε πρώτα requirements/lock files ή κατέγραψε εκδόσεις από λειτουργικό environment. Δημιούργησε νέο venv με την τρέχουσα Python και επανεγκατέστησε συμβατά πακέτα. Μην αντιγράφεις στα τυφλά bin/python ή site-packages ανάμεσα σε Android και desktop. Έλεγξε native wheels.

## Πρακτικό εργαστήριο
Σε αναλώσιμο project δημιούργησε venv, επιθεώρησε pyvenv.cfg και sys.executable και μετέφερέ το. Κατέγραψε αν scripts αναφέρονται στην παλιά διαδρομή. Αναδημιούργησε το environment αντί για χειροκίνητη τροποποίηση αγνώστων binary paths.
