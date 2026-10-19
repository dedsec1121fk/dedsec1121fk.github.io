# ImportError: διαχώρισε module, σύμβολο και κυκλική εισαγωγή

## Τι συμβαίνει και πότε
Το ImportError μπορεί να εμφανιστεί όταν βρίσκεται το module αλλά λείπει το ζητούμενο σύμβολο, όταν μια compiled extension είναι ασύμβατη ή όταν υπάρχει κυκλική εισαγωγή κατά την αρχικοποίηση. Το ModuleNotFoundError είναι ειδικότερη υποκλάση. Η επαναλαμβανόμενη εγκατάσταση πακέτων δεν διορθώνει λάθος όνομα ή κύκλο dependencies.

## Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 012_ImportError.py και εκτέλεσε `python3 012_ImportError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
import importlib
import math
assert hasattr(math, "sqrt")
try:
    exec("from math import sqrt_typo")
except ImportError as exc:
    assert "sqrt_typo" in str(exc)
else:
    raise AssertionError("missing name imported")
assert importlib.import_module("math").sqrt(9) == 3.0
~~~

## Διαγνωστική διαδικασία και ασφαλής διόρθωση
Διάβασε ολόκληρο το traceback και τη διαδρομή φόρτωσης, όχι μόνο την τελευταία γραμμή. Έλεγξε python3 -c 'import module; print(module.__file__)' για modules με αρχείο, την έκδοση API και τα διαθέσιμα ονόματα. Αν εμφανίζεται partially initialized module, σχεδίασε το γράφημα imports και βάλε τις κοινές δηλώσεις σε τρίτο module. Μην ονομάζεις τοπικά αρχεία json.py ή typing.py.

## Πρακτικό εργαστήριο / έλεγχος ορίων
Δημιούργησε a.py που εισάγει b και b.py που εισάγει a, με πρόωρη προσπέλαση ιδιότητας. Παρατήρησε τη διάγνωση κυκλικού import και μετέφερε κοινές σταθερές σε common.py. Σύγκρινε με απλό τυπογραφικό λάθος σε imported symbol.

## Αναπαραγωγή συμβόλου που λείπει σε προσωρινό φάκελο
Το παράδειγμα ξεχωρίζει ένα module που υπάρχει από ένα όνομα που δεν εξάγει. Δημιουργεί δύο τοπικά αρχεία, τα εκτελεί σε νέα διεργασία Python και μετά προσθέτει το σύμβολο. Δεν χρειάζεται pip ούτε εξωτερικό πακέτο.

~~~python
import sys, subprocess, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as temp:
    folder = Path(temp)
    helper = folder / 'helper.py'
    main = folder / 'main.py'
    helper.write_text('VALUE = 3\n', encoding='utf-8')
    main.write_text('from helper import MISSING\nprint(MISSING)\n', encoding='utf-8')
    def run():
        return subprocess.run([sys.executable, str(main)],
                              cwd=folder, capture_output=True, text=True)
    broken = run()
    assert broken.returncode != 0 and 'ImportError' in broken.stderr
    helper.write_text('VALUE = 3\nMISSING = 5\n', encoding='utf-8')
    fixed = run()
    assert fixed.returncode == 0 and fixed.stdout.strip() == '5', fixed.stderr
~~~

## Διάκριση των αιτιών
Στην πρώτη εκτέλεση η Python βρίσκει το helper.py, αλλά δεν βρίσκει το MISSING. Το ModuleNotFoundError δηλώνει αποτυχία εύρεσης module, ενώ το μήνυμα partially initialized module συχνά δείχνει κυκλική εισαγωγή. Σε πραγματικό σφάλμα εξέτασε το __file__ του module, τα ονόματα που εξάγει και το πρώτο σημείο εισαγωγής. Ως τελική δοκιμή δημιούργησε κύκλο δύο modules και μετέφερε τους κοινούς ορισμούς σε common.py. Εξήγησε γιατί η επανεγκατάσταση δεν λύνει έναν κύκλο.
