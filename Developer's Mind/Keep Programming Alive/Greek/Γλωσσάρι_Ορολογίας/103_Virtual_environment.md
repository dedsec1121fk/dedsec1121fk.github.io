# Εικονικό περιβάλλον Python — απομόνωση εξαρτήσεων, όχι προστασία του συστήματος

## Τι κάνει και τι δεν κάνει
Ένα εικονικό περιβάλλον Python έχει δικά του σημεία εκκίνησης interpreter και χώρο πακέτων site-packages, με ρυθμίσεις μέσω pyvenv.cfg. Μειώνει τις συγκρούσεις εξαρτήσεων διαφορετικών έργων, αλλά **δεν περιορίζει κακόβουλα πακέτα όπως ένα sandbox λειτουργικού συστήματος**. Κώδικας μέσα στο περιβάλλον διατηρεί τα δικαιώματα του χρήστη του και μπορεί να προσπελάσει επιτρεπόμενα αρχεία ή δίκτυο. Δεν πρέπει να συγχέεται με container ή ισχυρό όριο ασφαλείας.

## Εκτελέσιμο πρόγραμμα Python 3
Αποθήκευσε ως virtual_env_lab.py και όχι venv.py: το δεύτερο όνομα θα σκίαζε την ενσωματωμένη βιβλιοθήκη. Εκτέλεσε python3 virtual_env_lab.py. Το πρόγραμμα δημιουργεί προσωρινό περιβάλλον χωρίς εγκατάσταση pip ή πρόσβαση στο δίκτυο, εκκινεί τον δικό του interpreter με απόλυτη διαδρομή και συγκρίνει sys.prefix με sys.base_prefix. Ο προσωρινός κατάλογος καθαρίζεται αυτόματα.

~~~python
import json
import os
from pathlib import Path
import subprocess
import tempfile
import venv

with tempfile.TemporaryDirectory() as directory:
    target = Path(directory) / 'isolated'
    venv.EnvBuilder(with_pip=False, symlinks=False).create(target)
    interpreter = target / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    assert interpreter.is_file()
    probe = 'import json,sys; print(json.dumps({"prefix":sys.prefix,"base":sys.base_prefix,"path":sys.executable}))'
    result = json.loads(subprocess.check_output([str(interpreter), '-c', probe], text=True))
    assert Path(result['prefix']).resolve() == target.resolve()
    assert result['prefix'] != result['base']
    assert Path(result['path']).is_file()
    print('PASS virtual environment: isolated interpreter prefix')
~~~

## Πώς καταλαβαίνουμε ποια Python εκτελείται
Στην Python το sys.prefix δείχνει τον ενεργό χώρο εγκατάστασης, ενώ το sys.base_prefix τον αρχικό. Μέσα σε virtual environment κανονικά διαφέρουν. Η χρήση της πλήρους διαδρομής interpreter αποφεύγει αμφιβολία για την ενεργοποίηση του shell. Στα Windows βρίσκεται συνήθως στο Scripts/python.exe, ενώ σε Linux/Termux στο bin/python. Η ενεργοποίηση είναι διευκόλυνση του περιβάλλοντος τερματικού, όχι απαραίτητη προϋπόθεση όταν καλείς απευθείας τον interpreter. Το εργαστήριο δεν εγκαθιστά εξωτερικά πακέτα.

## Ασκήσεις σφαλμάτων
1. Μετονόμασε εσκεμμένα το δοκιμαστικό αρχείο σε venv.py μέσα σε προσωρινό κατάλογο και παρατήρησε ότι η import venv φορτώνει λάθος αρχείο. Επανέφερε το σωστό όνομα και καθάρισε το __pycache__.
2. Σύγκρινε sys.executable, sys.prefix και sys.base_prefix εντός και εκτός περιβάλλοντος και εξήγησε ποιες τιμές αλλάζουν.
3. Δοκίμασε python -m pip --version με τον σωστό interpreter **μόνο αν το pip έχει εγκατασταθεί**. Εξήγησε γιατί εγκατάσταση σε διαφορετική Python οδηγεί σε ImportError.
4. Περιέγραψε τον κίνδυνο εγκατάστασης μη έμπιστου πακέτου ακόμη και μέσα σε virtual environment.

**Παραδοτέα:** PASS, διαδρομές interpreter, αναπαραγωγή της σύγκρουσης ονόματος και αιτιολόγηση της έλλειψης sandbox.
