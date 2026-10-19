# Συνταγή: έλεγχος σύνταξης Bash χωρίς εκτέλεση άγνωστου κώδικα

## Σενάριο και κριτήρια επιτυχίας
Όταν επιθεωρείς ένα Bash script από πακέτο γνώσης, ξεκίνα με συντακτικό έλεγχο αντί να το εκτελέσεις. Η `bash -n` εντοπίζει ελλείποντα `fi` και πολλά λάθη γραμματικής χωρίς να εκτελεί κανονικές εντολές του script. Η δοκιμή δημιουργεί ένα σωστό και ένα προβληματικό αρχείο σε προσωρινό κατάλογο και ελέγχει τους κωδικούς εξόδου.

## Πλήρες εκτελέσιμο παράδειγμα
Αποθήκευσε ως `08_Shell_check.py` και εκτέλεσε με Python 3 και την ενσωματωμένη βιβλιοθήκη. Δεν απαιτείται διαδίκτυο ή πρόσβαση σε πραγματικά αρχεία σου.

~~~python
import shutil, subprocess, tempfile
from pathlib import Path
bash = shutil.which("bash")
if bash is None:
    raise SystemExit("SKIP: Bash executable not present")
with tempfile.TemporaryDirectory() as folder:
    good = Path(folder)/"good.sh"
    broken = Path(folder)/"broken.sh"
    good.write_text('echo "This is never executed"\n',encoding="utf-8")
    broken.write_text("if true; then\necho missing fi\n",encoding="utf-8")
    ok = subprocess.run([bash,"-n",str(good)],capture_output=True,text=True)
    bad = subprocess.run([bash,"-n",str(broken)],capture_output=True,text=True)
    assert ok.returncode==0
    assert bad.returncode!=0
    lint = shutil.which("shellcheck")
    if lint is not None:
        print("ShellCheck available; run manually with",lint)
print("PASS Bash syntax-only validation")
~~~

## Τεχνική εξήγηση
Η επιτυχία συντακτικού ελέγχου δεν εγγυάται ότι το script είναι ασφαλές ή ορθό. Η Bash δεν αναγνωρίζει αυτόματα επικίνδυνες εντολές, εισαγωγή κακόβουλων ορισμάτων ή προβλήματα αρχείων κατά την εκτέλεση. Μην εκτελείς άγνωστο script επειδή πέρασε το bash -n. Το ShellCheck μπορεί να βρει πρόσθετα στατικά προβλήματα μόνο αν είναι εγκατεστημένο. Οι κλήσεις subprocess περνούν λίστα ορισμάτων, χωρίς shell=True.

## Περιορισμένες ασκήσεις
Φτιάξε συντακτικά σωστό script που περιλαμβάνει επικίνδυνη εντολή διαγραφής και δες ότι η bash -n την αποδέχεται· εξήγησε γιατί χρειάζεται ανθρώπινη επιθεώρηση. Δοκίμασε ελλιπή εισαγωγικά και παρενθέσεις και κατάγραψε τους κωδικούς εξόδου. Αν λείπει η Bash από Linux/Termux, σημείωσε ότι ο έλεγχος παραλείφθηκε αντί να δηλώσεις επιτυχία.

## Διάγνωση και ασφάλεια
Χωρίς Bash δεν υπάρχει πραγματικός συντακτικός έλεγχος. Αν λείπει το ShellCheck, δήλωσε ότι δεν έγινε αντίστοιχος στατικός έλεγχος. Μη μηδενικός κωδικός της bash -n σημαίνει πρόβλημα γραμματικής και πρέπει να εμποδίζει αυτοματοποιημένη εκτέλεση.
