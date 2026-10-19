# Ανάγνωση binary format με πραγματικά offsets και όρια

## Φτιάξε συνθετικό αρχείο που σου ανήκει
Μία υπογραφή στα αρχικά bytes υποδεικνύει πιθανή μορφή, δεν αποδεικνύει ότι όλα τα πεδία είναι σωστά. Κατασκεύασε fixture με τετραψήφιο marker, μη προσημασμένο μήκος little-endian και UTF-8 περιεχόμενο. Το σταθερό header είναι 8 bytes και τα δεδομένα ξεκινούν αμέσως μετά. Κάθε δηλωμένο μήκος πρέπει να ελέγχεται σε σχέση με τα πραγματικά bytes που απομένουν.

~~~python
from struct import pack, unpack_from
blob = b"DEMO" + pack("<I", 3) + b"cat"
assert blob[:4] == b"DEMO"
length = unpack_from("<I", blob, 4)[0]
assert length <= len(blob) - 8
assert blob[8:8+length] == b"cat"
~~~

## Δύο ελεγχόμενες αποτυχίες
Κόψε το τελευταίο byte και βεβαιώσου ότι ο parser απορρίπτει το ελλιπές payload. Έπειτα βάλε στο header υπερβολικά μεγάλο μήκος, χωρίς να δεσμεύσεις τόση μνήμη. Ο έλεγχος απέναντι στο πραγματικό μέγεθος αποτρέπει λανθασμένες παραδοχές για slices και επικίνδυνες δεσμεύσεις πόρων. Κενή έξοδος από malformed input δεν πρέπει να παρουσιάζεται ως επιτυχία.

## Παρατήρηση και υπόθεση
Σε hex viewer κατέγραψε τα πρώτα 16 bytes και σημείωσε offset, μέγεθος, signedness και endian για κάθε πεδίο. Αν άγνωστο αρχείο αρχίζει με bytes που θυμίζουν ELF, PE ή ZIP, επιβεβαίωσε και τη δομή με read-only εργαλείο. Μην εκτελείς άγνωστα δείγματα απλώς για περιέργεια.

## Τεκμήρια εργαστηρίου
Φτιάξε πίνακα πεδίων, hashes τριών fixtures, αποδεκτές και μη αποδεκτές εισόδους και σαφές error για truncation. Η τεκμηρίωση reverse engineering χρειάζεται τα bytes που δικαιολογούν κάθε συμπέρασμα, όχι μόνο όνομα format.

## Μετέτρεψε τις παρατηρήσεις σε σύμβαση parser
Αυτή η μορφή περιέχει ακριβώς ένα record. Απόρριψε μικρό header, λάθος marker, μήκος εκτός buffer, άκυρο UTF-8 και επιπλέον bytes. Το όριο payload περιορίζει αποκωδικοποιημένο κείμενο, αλλά ο file reader χρειάζεται δικό του input-byte limit πριν φορτώσει μεγάλο αρχείο.
~~~python
from struct import pack, unpack_from

def parse_record(blob):
    if len(blob) < 8:
        raise ValueError('short header')
    if blob[:4] != b'DEMO':
        raise ValueError('bad magic')
    length = unpack_from('<I', blob, 4)[0]
    if length > 1024 or length != len(blob) - 8:
        raise ValueError('invalid length')
    return blob[8:].decode('utf-8', errors='strict')

valid = b'DEMO' + pack('<I', 3) + b'cat'
assert parse_record(valid) == 'cat'
for broken in (b'', valid[:-1], valid + b'!',
               b'DEMO' + pack('<I', 2**32-1),
               b'DEMO' + pack('<I', 1) + b'\xff'):
    try:
        parse_record(broken)
    except (ValueError, UnicodeDecodeError):
        continue
    raise AssertionError('malformed record accepted')
~~~
Ο έλεγχος `length != len(blob) - 8` γίνεται μόνο αφού αποδειχθεί ότι υπάρχει header. Η σειρά μετρά σε γλώσσες με unsigned arithmetic, όπου αφαίρεση οκτώ από μικρότερο μέγεθος μπορεί να κάνει underflow. Οι Python integers δεν υπερχειλίζουν, αλλά μελλοντική υλοποίηση του format μπορεί να χρησιμοποιεί fixed-width τύπους.

## Bytes και χαρακτήρες έχουν διαφορετικά μήκη
Στο `γάτα`, το πλήθος UTF-8 bytes διαφέρει από το πλήθος χαρακτήρων Python. Αποθήκευσε το μήκος των encoded bytes και έλεγξε χωριστά το decoded string. Ο πίνακας πεδίων πρέπει να ξεχωρίζει offset 4 για το length από offset 8 για την αρχή payload και να δηλώνει little-endian. Η παρούσα σύμβαση απορρίπτει padding· πολλαπλά records απαιτούν cursor και διαφορετική πολιτική trailing data.

Πηγή: [Python struct](https://docs.python.org/3/library/struct.html).
