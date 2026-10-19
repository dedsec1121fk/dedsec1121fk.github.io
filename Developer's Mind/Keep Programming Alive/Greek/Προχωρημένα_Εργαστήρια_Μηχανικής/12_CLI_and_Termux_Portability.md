# Φορητότητα CLI και Termux — απογραφή χωρίς αλλαγές

## Στόχος και απαιτήσεις
Κατασκεύασε εργαλείο που διαβάζει τα ονόματα αρχείων από επιλεγμένο κατάλογο. Η διαδρομή μπορεί να περιλαμβάνει ελληνικούς χαρακτήρες και κενά. Τα ονόματα πρέπει να εμφανίζονται ταξινομημένα, προαιρετικά σε μορφή JSON, με όριο αποτελεσμάτων από 1 έως 20. Αν ο κατάλογος δεν υπάρχει ή το όριο είναι άκυρο, η λειτουργία αποτυγχάνει καθαρά. Δεν επιτρέπονται αυθαίρετες εγγραφές σε αρχεία, αιτήματα δικτύου, αλλαγές δικαιωμάτων Android ή ενημέρωση πακέτων.

## Εκτελέσιμο εργαστήριο Python 3
Αποθήκευσε ως cli_lab.py και εκτέλεσε python3 cli_lab.py. Η TemporaryDirectory δημιουργεί τεχνητό φάκελο δοκιμής με ελληνικά γράμματα και ο έλεγχος καλύπτει αποδεκτές και απορριπτέες τιμές.

~~~python
import argparse
import io
import json
from pathlib import Path
from tempfile import TemporaryDirectory

def main(argv, out):
    parser = argparse.ArgumentParser(description='Read-only file inventory')
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--limit', type=int, default=10)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args(argv)
    if not args.root.is_dir():
        raise ValueError('root must be an existing directory')
    if not 1 <= args.limit <= 20:
        raise ValueError('limit must be between 1 and 20')
    rows = sorted((p.name for p in args.root.iterdir() if p.is_file()))[:args.limit]
    if args.json:
        print(json.dumps({'files': rows}, ensure_ascii=False), file=out)
    else:
        for name in rows:
            print(name, file=out)
    return 0

with TemporaryDirectory(prefix='δοκιμή διάστημα ') as root:
    home = Path(root)
    (home / 'άλφα test.txt').write_text('data', encoding='utf-8')
    (home / 'b.txt').write_text('', encoding='utf-8')
    buf = io.StringIO()
    assert main(['--root', root, '--limit', '1', '--json'], buf) == 0
    assert json.loads(buf.getvalue())['files'] == ['b.txt']
    for argv in (['--root', root, '--limit', '0'],
                 ['--root', '/path/that/does/not/exist']):
        try: main(argv, io.StringIO())
        except ValueError: pass
        else: raise AssertionError('invalid input accepted')
print('PASS cli: Unicode paths, JSON, sorting, range failures')
~~~

## Πώς χωρίζονται οι ευθύνες
Η argparse αναλύει τη σύνταξη των ορισμάτων, ενώ ο έλεγχος αν υπάρχει κατάλογος και αν το όριο ανήκει στο διάστημα 1–20 αφορά τους κανόνες της εφαρμογής. Η συνάρτηση main(argv, out) δέχεται τη ροή εξόδου ως παράμετρο ώστε να ελέγχουμε το JSON χωρίς αλλαγή της καθολικής stdout. Η ταξινόμηση αποτρέπει τυχαίες διαφορές σειράς. Η pathlib.Path χειρίζεται σωστά Unicode διαδρομές, παρότι ο χρήστης πρέπει να βάζει εισαγωγικά γύρω από ονόματα με κενά στο κέλυφος. Η επιλογή ensure_ascii=False διατηρεί ευανάγνωστα ελληνικά στο JSON. Στην τελική εφαρμογή πιάσε τη ValueError εξωτερικά και εμφάνισε μήνυμα στην stderr με κωδικό εξόδου 2. Η argparse χρησιμοποιεί SystemExit για βοήθεια ή σφάλματα σύνταξης. Η Path.is_file μπορεί να ακολουθεί συμβολικούς συνδέσμους, γι' αυτό χρειάζεται ξεχωριστή απόφαση για την πολιτική τους.

## Στοχευμένες ασκήσεις
1. Δοκίμασε άδειο φάκελο, ελληνική διαδρομή και όνομα αρχείου με αγκύλες. Έλεγξε το ακριβές αποτέλεσμα JSON.
2. Δοκίμασε --limit 0, --limit 21, ανύπαρκτο κατάλογο και --help. Σημείωσε εξαιρέσεις, μηνύματα και κωδικούς εξόδου.
3. Πρόσθεσε κεντρικό χειρισμό σφαλμάτων, χωρίς να εμφανίζεται ψευδής επιτυχία σε απορριπτέο όρισμα.
4. Εκτέλεσε το εργαλείο από μη εγγράψιμο κατάλογο εργασίας. Για Termux, ξεχώρισε τον ιδιωτικό χώρο της εφαρμογής από τον κοινόχρηστο αποθηκευτικό χώρο.

**Παραδοτέα:** μήνυμα PASS, αποτέλεσμα JSON, τουλάχιστον δύο αποτυχίες, έκδοση Python και επιβεβαίωση ότι δεν αλλάχθηκαν πραγματικά αρχεία.
