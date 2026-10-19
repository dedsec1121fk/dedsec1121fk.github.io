# pip Failed building wheel: διάβασε το αρχικό σφάλμα

## Αναγνώριση της πραγματικής αποτυχίας
Κάποια Python packages έχουν wheel μόνο για συγκεκριμένη CPython, OS και CPU· άλλα απαιτούν compiler/headers. Το Failed building wheel είναι συνήθως τελική περίληψη και όχι η πρώτη αιτία. Σε Termux πολλά desktop wheels δεν είναι συμβατά.

## Ασφαλής αρχικός έλεγχος
~~~sh
python -VV
python -m pip --version
python -m pip install -v PACKAGE
~~~

## Διόρθωση αιτίας χωρίς παράκαμψη προειδοποίησης
Εξέτασε το πρώτο error πριν από το summary: header που λείπει, Python version, απαίτηση Rust/C compiler ή metadata. Επιβεβαίωσε συμβατό release και πλατφόρμα. Προτίμησε supported wheel ή package του distro· όχι τυχαία flags από άγνωστο forum.

**Τεκμηρίωση:** https://pip.pypa.io/en/stable/cli/pip_install/

## Ψάξε το πρώτο σφάλμα, όχι την τελευταία γραμμή
Το `Failed building wheel` είναι συνήθως σύνοψη της pip. Άνοιξε λίγο ψηλότερα το πλήρες log: `Python.h: No such file` δείχνει headers, `gcc/clang not found` compiler, αποτυχία `pkg-config` εξωτερική βιβλιοθήκη, ενώ μήνυμα για Rust ή `maturin` αφορά άλλο build backend. Επίσης το πακέτο μπορεί να μην έχει wheel για τη συγκεκριμένη έκδοση Python ή CPU.

## Αναπαραγωγή χωρίς εγκατάσταση στο σύστημα
Αφού ενεργοποιήσεις ένα δικό σου virtual environment, στον φάκελο πηγαίου κώδικα που εμπιστεύεσαι δοκίμασε:
~~~sh
python -m pip --version
python -m pip wheel --no-deps . -v
~~~
Η δεύτερη εντολή χτίζει wheel για το τοπικό project χωρίς να το εγκαταστήσει στην καθολική Python. Αν επιτύχει, αλλά η κανονική εγκατάσταση αποτυγχάνει, το πρόβλημα μπορεί να βρίσκεται σε εξάρτηση. Αν αποτύχει και αυτή, κράτα τις πρώτες σχετικές γραμμές για το backend και το toolchain.

## Διαφοροποίηση ανά λειτουργικό
Στα Windows ο compiler και τα διαθέσιμα binary wheels διαφέρουν από τα Linux. Στο Termux τα wheels για τυπικό desktop Linux δεν είναι απαραίτητα συμβατά με Android/Bionic, οπότε μια προσπάθεια τοπικού compile μπορεί να χρειάζεται βιβλιοθήκες του Termux ή να μην υποστηρίζεται. Μην εγκαθιστάς τυχαία packages ή global compilers επειδή το μήνυμα λέει μόνο «wheel failed».

## Σωστή τελική επαλήθευση
Σημείωσε package version, Python version, ABI, αρχιτεκτονική και build backend, κάνε ένα ελάχιστο δοκιμαστικό build σε απομονωμένο φάκελο και επανάλαβε μόνο μετά από στοχευμένη διόρθωση της συγκεκριμένης εξάρτησης.
