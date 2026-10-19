# Στα Windows το όνομα python μπορεί να δείχνει αλλού

## Ανακάλυψε ποιο πρόγραμμα εκκινείται
Στο PowerShell aliases, functions και executables μπορούν να έχουν παρόμοια ονόματα. Το `py` launcher ίσως επιλέγει άλλη εγκατάσταση Python από την εντολή `python` στο PATH. Αν ένα πακέτο εγκαταστάθηκε σε διαφορετικό interpreter, δεν γίνεται διαθέσιμο παντού. Επιθεώρησε τη διαδρομή πριν επεξεργαστείς environment variables ή επανεγκαταστήσεις εργαλεία.

~~~powershell
Get-Command python -All
Get-Command py -All
where.exe python
py -0p
python -c "import sys; print(sys.executable)"
~~~

## Το venv δεν μεταφέρεται πάντα ως έχει
Virtual environment που δημιουργήθηκε σε άλλο μηχάνημα μπορεί να περιέχει διαδρομές προς interpreter που δεν υπάρχει εδώ. Ανακατασκεύασέ το από manifest εξαρτήσεων αντί να αντιγράφεις όλο τον φάκελο. Η PowerShell activation μπορεί να επηρεάζεται από execution policy, αλλά η άμεση εκτέλεση `.venv\Scripts\python.exe` συχνά δεν χρειάζεται activation. Μην απενεργοποιείς την ασφάλεια των Windows συνολικά.

## Ερμήνευσε σωστά τα μηνύματα
Το «Python not found» δείχνει αναζήτηση εντολής ή εγκατάσταση. Το «ModuleNotFoundError» αφού ξεκινήσει η Python δείχνει θέμα dependencies, interpreter ή module shadowing. Το «Access denied» για εκτελέσιμο σχετίζεται με πολιτικές και δικαιώματα. Πρόκειται για διαφορετικές διορθώσεις.

## Δοκιμή σε προσωρινό project
Φτιάξε μικρό project με requirements και νέο venv. Τύπωσε `sys.executable`, εγκατέστησε ένα ασφαλές dependency με `-m pip` από τον συγκεκριμένο interpreter και εκτέλεσε import. Σημείωσε έκδοση Windows, αρχιτεκτονική και την επιλογή launcher. Απόφυγε administrator δικαιώματα όπου δεν χρειάζονται.

## Επίλεξε interpreter χωρίς activation
~~~powershell
& .\.venv\Scripts\python.exe -c "import sys; print(sys.executable); print(sys.prefix)"
& .\.venv\Scripts\python.exe -m pip --version
~~~
Ο call operator `&` βοηθά ιδιαίτερα όταν το executable path βρίσκεται σε μεταβλητή ή έχει spaces. Το activation αλλάζει το environment του τρέχοντος shell και δεν είναι απαραίτητο για άμεση χρήση του interpreter. Το παλιό `py -0p` δεν υποστηρίζεται από κάθε υλοποίηση launcher· αν απορρίπτεται, έλεγξε το `py --help`.

## Άλλαξε το στενότερο scope
Το `$env:Path` αφορά τη συγκεκριμένη διεργασία. Οι μόνιμες user-level και machine-level ρυθμίσεις έχουν διαφορετικό scope και εξουσία. Ήδη ανοιχτά shells δεν λαμβάνουν αυτόματα όλες τις αλλαγές άλλων διεργασιών. Μετά από σκόπιμη αλλαγή PATH άνοιξε νέο shell, εκτέλεσε `Get-Command python -All` και ξαναδές `sys.executable`. Διατήρησε τα άσχετα PATH entries αντί να αντικαθιστάς ολόκληρη την τιμή.

Δοκίμασε διαδρομή με spaces και τοπικό αρχείο `json.py`: το δεύτερο μπορεί να σκιάζει standard-library module ανεξάρτητα από το PATH. Η αλυσίδα περιλαμβάνει shell command lookup και Python module lookup. Η καταγραφή μόνο του πρώτου δεν εξηγεί ολόκληρη τη βλάβη.
