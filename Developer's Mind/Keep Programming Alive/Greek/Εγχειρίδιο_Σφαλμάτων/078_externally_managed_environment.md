# Python externally managed: προστασία system Python

## Αναγνώριση της πραγματικής αποτυχίας
Η PEP 668 επιτρέπει στο distro να προστατεύει τη system Python από global pip installs. Αποφεύγει συγκρούσεις με OS packages. Το μήνυμα είναι όριο διαχείρισης και όχι χαλασμένη pip.

## Ασφαλής αρχικός έλεγχος
~~~sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install PACKAGE
~~~

## Διόρθωση αιτίας χωρίς παράκαμψη προειδοποίησης
Σε Debian/Ubuntu ίσως χρειάζεται python3-venv. Σε Termux επιβεβαίωσε τα δικά του packages, όχι τυφλή χρήση ονομάτων Debian. Το --break-system-packages παρακάμπτει προστασία και μπορεί να βλάψει εργαλεία OS. Το pipx είναι κατάλληλο για μεμονωμένα CLI apps.

**Τεκμηρίωση:** https://peps.python.org/pep-0668/

## Τι προστατεύει το PEP 668
Ορισμένες διανομές Linux επισημαίνουν την Python τους ως **externally managed** επειδή τα πακέτα αποτελούν ευθύνη του διαχειριστή συστήματος. Η `pip install` στο system interpreter μπορεί να συγκρουστεί με αρχεία που εγκατέστησε η διανομή. Δεν σημαίνει ότι το pip είναι χαλασμένο ή ότι λείπουν δικαιώματα root.

## Ασφαλές παράδειγμα για δικό σου project
Σε έναν φάκελο πειραμάτων:
~~~sh
python3 -m venv .venv
.venv/bin/python -m pip --version
.venv/bin/python -m pip install requests
~~~
Έτσι η εξάρτηση εγκαθίσταται στο εικονικό περιβάλλον του project. Με `.venv/bin/python -c "import sys; print(sys.executable)"` θα δεις το αντίστοιχο εκτελέσιμο. Σε Windows το μονοπάτι είναι `.venv\Scripts\python.exe`. Αν η δημιουργία venv δεν υποστηρίζεται από το τοπικό Python πακέτο, χρειάζεται πρώτα εγκατάσταση της δυνατότητας venv από τον διαχειριστή πακέτων της διανομής.

## Τι να ΜΗΝ κάνεις
Η επιλογή `--break-system-packages` παρακάμπτει την προστασία και μπορεί να προκαλέσει ασυμβατότητες στα εργαλεία του λειτουργικού, άρα δεν είναι η κανονική λύση. Για Python command-line εφαρμογές εξέτασε `pipx` εφόσον υπάρχει. Στο Termux η εγκατάσταση και οι περιορισμοί της Python διαφέρουν από Ubuntu/Debian: πρώτα έλεγξε τον πραγματικό interpreter και το πακέτο `python` του περιβάλλοντος.

## Κριτήριο επιτυχίας
Το νέο project πρέπει να εισάγει την εξάρτηση μέσα από την `.venv`, χωρίς να τροποποιήσει global site-packages ή εργαλεία της διανομής.
