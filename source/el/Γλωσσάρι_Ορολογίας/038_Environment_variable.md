# Μεταβλητή περιβάλλοντος — ρυθμίσεις διεργασίας, όχι αποθήκη μυστικών

## Πραγματικός ορισμός
Η μεταβλητή περιβάλλοντος είναι ονομασμένη συμβολοσειρά που υπάρχει στο περιβάλλον μίας διεργασίας. Οι νέες διεργασίες συνήθως κληρονομούν αντίγραφο του περιβάλλοντος της γονικής τους, εκτός αν ο εκκινητής ορίζει άλλο. Χρησιμοποιείται για λειτουργία εφαρμογής, διαδρομές εκτελέσιμων και μη ευαίσθητες ρυθμίσεις. **Δεν είναι ασφαλές θησαυροφυλάκιο κωδικών**: εργαλεία διάγνωσης, logs ή προγράμματα με κατάλληλα δικαιώματα μπορούν να αποκαλύψουν στοιχεία που έχουν αποθηκευτεί εκεί.

## Εκτελέσιμο πρόγραμμα Python 3
Αποθήκευσε ως environment_lab.py και εκτέλεσε python3 environment_lab.py. Το παράδειγμα ορίζει ξεχωριστό περιβάλλον για κάθε subprocess χωρίς να αλλάζει τις ρυθμίσεις του χρήστη. Ελέγχει ότι το child βλέπει τη σωστή τιμή, εφαρμόζεται προεπιλογή όταν η ρύθμιση λείπει, μια άκυρη τιμή απορρίπτεται και η αλλαγή στο child δεν μεταβάλλει το parent.

~~~python
import os
import subprocess
import sys

KEY = 'DEDSEC_DEMO_MODE'
ALLOWED = {'development', 'test', 'production'}

def read_mode(environment):
    value = environment.get(KEY, 'development')
    if value not in ALLOWED:
        raise ValueError('unexpected mode')
    return value

def run_child(value):
    env = dict(os.environ)
    env.pop(KEY, None)
    if value is not None:
        env[KEY] = value
    command = [sys.executable, '-c',
               'import os; print(os.environ.get("DEDSEC_DEMO_MODE", "unset"))']
    return subprocess.check_output(command, env=env, text=True).strip()

assert read_mode({}) == 'development'
assert read_mode({KEY: 'test'}) == 'test'
try:
    read_mode({KEY: 'unknown'})
except ValueError:
    pass
else:
    raise AssertionError('unknown mode was accepted')
assert run_child('test') == 'test'
assert run_child(None) == 'unset'
original = os.environ.get(KEY)
command = [sys.executable, '-c',
           'import os; os.environ["DEDSEC_DEMO_MODE"]="child"; print(os.environ["DEDSEC_DEMO_MODE"])']
assert subprocess.check_output(command, text=True).strip() == 'child'
assert os.environ.get(KEY) == original
print('PASS environment: injection, defaults, validation, parent isolation')
~~~

## Διάρκεια ζωής και όρια εμπιστοσύνης
Το όρισμα env στο subprocess ορίζει τι θα παραλάβει η νέα διεργασία. Αλλαγή της os.environ στο τρέχον Python πρόγραμμα επηρεάζει επόμενες θυγατρικές διεργασίες, όχι όμως το shell που ξεκίνησε νωρίτερα την Python. Η αλλαγή μέσα στο child δεν επιστρέφει στην αρχική διεργασία. Ρυθμίσεις τύπου APP_MODE απαιτούν επικύρωση όπως κάθε άλλη είσοδος: μια αυθαίρετη τιμή μπορεί να ενεργοποιήσει επικίνδυνο debugging. Για πραγματικά μυστικά χρησιμοποίησε κατάλληλο διαχειριστή credentials και μην τα τυπώνεις ποτέ. Εδώ χρησιμοποιείται μόνο μη ευαίσθητη δοκιμαστική τιμή.

## Ασκήσεις και διάγνωση
1. Τρέξε το πρόγραμμα χωρίς τη ρύθμιση και με τιμή test. Σύγκρινε την κληρονομιά μεταβλητών και το ρητό env mapping.
2. Εμφάνισε μόνο αν υπάρχει ένα μυστικό κλειδί, όχι το περιεχόμενό του. Εξήγησε τον κίνδυνο αποτύπωσης σε log.
3. Δώσε μη επιτρεπτή τιμή staging και επιβεβαίωσε ότι η επεξεργασία αποτυγχάνει πριν από πραγματική ενέργεια.
4. Σύγκρινε Linux/Termux και Windows όσον αφορά εκκίνηση διεργασιών και διάκριση πεζών-κεφαλαίων στα ονόματα ρυθμίσεων.

**Παραδοτέα:** PASS, πίνακας parent/child, μία σκόπιμη απόρριψη και τεκμηριωμένος κανόνας για credentials.
