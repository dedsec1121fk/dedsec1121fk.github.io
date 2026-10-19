# Imports Python στο Termux: σωστός interpreter και στόχος εγκατάστασης

## Γιατί συμβαίνει
Το επιτυχημένο pip install δεν αποδεικνύει ότι το Python process βλέπει το module. Το PATH μπορεί να επιλέγει άλλο Python, το pip να ανήκει σε διαφορετικό environment, το όνομα import να διαφέρει από το package name ή τοπικά αρχεία να κρύβουν modules. Για native extensions η ασυμβατότητα Android/Termux ABI είναι άλλο πρόβλημα από το ModuleNotFoundError.

## Ελεγχόμενες εντολές διάγνωσης

~~~sh
python -c 'import sys; print(sys.executable); print(sys.version)'
python -m pip --version
python -m pip list
python -c 'import importlib.util; print(importlib.util.find_spec("json"))'
# For your target package, inspect:
# python -m pip show PACKAGE
~~~

## Ασφαλής πορεία διόρθωσης
Χρησιμοποίησε python -m pip αντί για αμφίσημο σκέτο pip και εγκατάστησε μόνο στο environment που εκτελεί την εφαρμογή. Στο Termux έλεγξε το pkg search πριν αλλάξεις system-managed Python πακέτα. Μη χρησιμοποιείς sudo και μη βάζεις Linux desktop wheels σε Android. Κράτα requirements και έκδοση interpreter για επαναληψιμότητα.

## Πρακτικό εργαστήριο
Φτιάξε δύο απομονωμένα Python environments με διαφορετικά δοκιμαστικά dependencies ή χρησιμοποίησε stdlib για έλεγχο. Κατέγραψε sys.executable και find_spec πριν/μετά την αλλαγή. Πρόσθεσε τοπικό json.py σε αναλώσιμο φάκελο, δες το module shadowing και αφαίρεσέ το.
