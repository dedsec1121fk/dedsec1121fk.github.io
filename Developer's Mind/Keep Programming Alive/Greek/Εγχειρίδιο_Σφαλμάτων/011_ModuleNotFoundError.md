# ModuleNotFoundError: εντόπισε το σωστό περιβάλλον Python

## Τι συμβαίνει και πότε
Το ModuleNotFoundError συχνά σημαίνει ότι ο interpreter που εκτελεί το πρόγραμμα δεν βλέπει το module· όχι ότι λείπει από κάθε Python της συσκευής. Το όνομα import μπορεί να διαφέρει από το όνομα διανομής στο pip, να είναι ανενεργό το virtual environment ή να υπάρχει τοπικό αρχείο με ίδιο όνομα.

## Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 011_ModuleNotFoundError.py και εκτέλεσε `python3 011_ModuleNotFoundError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
import importlib.util
import sys
from pathlib import Path
print("interpreter:", sys.executable)
print("cwd:", Path.cwd())
print("json location:", importlib.util.find_spec("json").origin)
assert importlib.util.find_spec("json") is not None
assert importlib.util.find_spec("_dedsec_missing_fixture_") is None
~~~

## Διαγνωστική διαδικασία και ασφαλής διόρθωση
Με τον ίδιο launcher της εφαρμογής εκτέλεσε python3 -c 'import sys; print(sys.executable)', μετά python3 -m pip --version και python3 -m pip show PACKAGE. Έλεγξε sys.path και ονόματα τοπικών αρχείων. Στο Termux μη μπερδεύεις το Python του Termux με system/άλλα Debian περιβάλλοντα. Εγκατέστησε στο σωστό environment, ιδανικά σε venv.

## Πρακτικό εργαστήριο / έλεγχος ορίων
Δημιούργησε απομονωμένο venv, τύπωσε sys.executable και έλεγξε find_spec για standard-library module. Εξήγησε γιατί το απλό pip από άλλο terminal μπορεί να αλλάζει διαφορετικό interpreter. Δοκίμασε σκόπιμα λανθασμένο import χωρίς εγκατάσταση πακέτου.

## Έλεγχος του διερμηνευτή χωρίς εγκατάσταση πακέτων
Χρησιμοποίησε το ίδιο εκτελέσιμο Python για μια σκόπιμα ανύπαρκτη βιβλιοθήκη και για έναν έγκυρο έλεγχο με τη standard library. Η επιλογή -I απομονώνει τη Python από πακέτα χρήστη και αρκετές μεταβλητές περιβάλλοντος. Είναι χρήσιμη στη διάγνωση, αλλά δεν αναπαράγει ακριβώς τις διαδρομές εισαγωγής της εφαρμογής.

~~~python
import sys, subprocess
missing_module = 'dedsec_missing_fixture_9f8a6d71'
missing_run = subprocess.run(
    [sys.executable, '-I', '-c', 'import '+missing_module],
    capture_output=True, text=True)
control_run = subprocess.run(
    [sys.executable, '-I', '-c', 'import json; print(json.dumps([1, 2]))'],
    capture_output=True, text=True)
assert missing_run.returncode != 0 and 'ModuleNotFoundError' in missing_run.stderr
assert control_run.returncode == 0 and control_run.stdout.strip() == '[1, 2]'
~~~

## Έλεγχος περιβάλλοντος, πακέτου και συγκρούσεων ονομάτων
Κατέγραψε το sys.executable της διεργασίας που απέτυχε και χρησιμοποίησε ακριβώς αυτό το εκτελέσιμο με -m pip show DISTRIBUTION. Το όνομα εγκατάστασης μπορεί να διαφέρει από το όνομα import. Έλεγξε τοπικά αρχεία όπως json.py και τις διαδρομές στο sys.path πριν επανεγκαταστήσεις οτιδήποτε. Αν η εισαγωγή λειτουργεί κανονικά αλλά αποτυγχάνει με -I, εξέτασε user-site packages, PYTHONPATH και υποθέσεις για τον τρέχοντα φάκελο. Στόχος είναι να εξηγήσεις γιατί δύο virtual environments δεν μοιράζονται απαραίτητα τα ίδια modules.
