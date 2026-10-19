# Ασφαλής επιθεώρηση — προκαταρκτικός έλεγχος ZIP

## Σενάριο και όριο εμπιστοσύνης
Ένα εργαλείο τοπικής γνώσης εισάγει ZIP από τρίτους. Τα ονόματα των περιεχομένων είναι μη έμπιστα μεταδεδομένα: ένας επιτιθέμενος μπορεί να δοκιμάσει διαδρομές έξω από τον φάκελο, απόλυτες διαδρομές, ανάποδες κάθετους Windows, διπλά ονόματα, συμβολικούς συνδέσμους Unix ή υπερβολικά μεγάλα αποσυμπιεσμένα αρχεία. Ο έλεγχος πρέπει να γίνεται πριν από οποιαδήποτε εξαγωγή. Η παρακάτω συνάρτηση **δεν εξάγει** αρχεία: είναι περιορισμένος προκαταρκτικός έλεγχος και όχι πλήρης ασφαλής αποσυμπιεστής.

## Εκτελέσιμο παράδειγμα Python 3
Αποθήκευσε ως zip_review.py και εκτέλεσε python3 zip_review.py. Οι δοκιμές δημιουργούν ZIP μέσα στη μνήμη, με τεχνητά ονόματα διαδρομών και σήμανση συμβολικού συνδέσμου.

~~~python
from io import BytesIO
from pathlib import PurePosixPath
from stat import S_IFMT, S_IFLNK
from zipfile import ZipFile, ZipInfo

def verify_manifest(blob, max_files=20, max_bytes=100_000):
    total, names = 0, set()
    with ZipFile(BytesIO(blob)) as archive:
        for member in archive.infolist():
            name = member.filename
            parts = name.rstrip('/').split('/')
            target = PurePosixPath(name)
            if (not name or target.is_absolute() or '\\' in name
                    or any(part in ('', '.', '..') for part in parts)
                    or any(ord(ch) < 32 for ch in name)):
                raise ValueError('invalid ZIP member path')
            if name in names:
                raise ValueError('duplicate ZIP member')
            names.add(name)
            mode = S_IFMT(member.external_attr >> 16)
            if mode == S_IFLNK:
                raise ValueError('symlink in archive')
            if member.is_dir():
                continue
            total += member.file_size
            if len(names) > max_files or total > max_bytes:
                raise ValueError('archive limit exceeded')
            if member.file_size > 0 and (member.compress_size == 0
                   or member.file_size > 100 * member.compress_size):
                raise ValueError('suspicious compression ratio')
    return len(names)

def fixture(name):
    b = BytesIO()
    with ZipFile(b, 'w') as z:
        z.writestr(name, 'hello')
    return b.getvalue()

assert verify_manifest(fixture('docs/lesson.txt')) == 1
for wrong in ('../private.txt', 'docs/../private.txt', '/absolute', 'back\\slash'):
    try: verify_manifest(fixture(wrong))
    except ValueError: pass
    else: raise AssertionError(wrong)
symlink = ZipInfo('linked')
symlink.create_system = 3
symlink.external_attr = (0o120777 << 16)
b = BytesIO()
with ZipFile(b, 'w') as z:
    z.writestr(symlink, 'outside')
try: verify_manifest(b.getvalue())
except ValueError: pass
else: raise AssertionError('symlink accepted')
print('PASS ZIP preflight: path traversal, absolute, backslash, symlink')
~~~

## Ερμηνεία κινδύνων και όρια της λύσης
Ο κώδικας απορρίπτει κενά και απόλυτα ονόματα, τμήματα . ή .., ανάποδες κάθετους και χαρακτήρες ελέγχου, ακριβή διπλότυπα, συμβολικούς συνδέσμους και ύποπτα δηλωμένα μεγέθη. Αυτό δεν καθιστά την πραγματική εξαγωγή ασφαλή. Τα μεταδεδομένα μεγέθους δεν είναι απόλυτα αξιόπιστα. Χρειάζεται όριο στα **πραγματικά αποσυμπιεσμένα byte**, στον χρόνο, στη χρήση πόρων και στον χώρο δίσκου. Ο πλήρης αποσυμπιεστής πρέπει να ελέγχει ότι η τελική διαδρομή παραμένει μέσα σε ειδικό προσωρινό κατάλογο, να απορρίπτει ειδικούς τύπους αρχείων και να χειρίζεται συγκρούσεις όπως A.txt και a.txt ή ισοδύναμα ονόματα Unicode. Δεν καλύπτονται όλοι οι κανόνες διαδρομών των Windows, όπως το C:foo. Μην κάνεις εξαγωγή πάνω από προσωπικά αρχεία χωρίς ρητή συγκατάθεση και σχέδιο επαναφοράς.

## Συγκεκριμένες δοκιμές αποτυχίας
1. Πρόσθεσε γράμμα δίσκου, όνομα με τελικό κενό, διπλό όνομα και δύο ονόματα με ισοδύναμη Unicode μορφή. Όρισε κανόνα και αντίστοιχη δοκιμή απόρριψης.
2. Σύγκρινε το δηλωμένο file_size με τα πραγματικά byte αποσυμπίεσης κάτω από αυστηρό όριο.
3. Σχεδίασε επίθεση με συμβολικό σύνδεσμο και επόμενο αρχείο που δείχνει έξω από τον προορισμό. Εξήγησε γιατί χρειάζεται έλεγχος πραγματικών διαδρομών.
4. Κατάγραψε εισόδους, δικαιώματα, εγγραφές, απαγορευμένες ενέργειες, μηνύματα αποτυχίας και καθαρισμό προσωρινού καταλόγου.

**Παραδοτέα:** PASS, πέντε απορριπτέα ZIP και δήλωση ότι δεν αποδείχθηκε ασφάλεια πραγματικής εξαγωγής.
## Πρόσθετη τεχνική ανάλυση

Η πολιτική browser χρειάζεται λειτουργικές δοκιμές μαζί με εξέταση κεφαλίδων. Ένας περιορισμός μπορεί να μπλοκάρει θέματα ή πλοήγηση ενώ η πρώτη εικόνα φαίνεται σωστή. Συγκέντρωσε ελεγχόμενες αναφορές και δοκίμασε αλληλεπιδράσεις πριν επιβολή. Ένα γενικό wildcard για καταστολή αναφορών μπορεί να ακυρώσει τον περιορισμό.

[Εφαρμογή Content Security Policy με αναφορές παραβιάσεων](#read:fieldnotes-el-45)
