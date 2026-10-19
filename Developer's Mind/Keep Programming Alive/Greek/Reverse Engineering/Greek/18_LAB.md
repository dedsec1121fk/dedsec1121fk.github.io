# Εργαστήριο reverse engineering: ανάλυση ιδιόκτητου φανταστικού binary format

## Στόχος και όρια
Δημιούργησε ένα μικρό **φανταστικό** αρχείο από κώδικα που ελέγχεις εσύ και βρες τη μορφή του με παρατήρηση των bytes. Απαιτείται μόνο Python 3, χωρίς λήψεις ή πραγματικούς servers. Η παλιότερη περιγραφή ανέφερε checksum, UTF-8 records και scripts σε `site/labs/` που δεν υπάρχουν εδώ. **Το DMR1 έκδοση 1 δεν περιλαμβάνει κανένα από αυτά.**

## Ακριβής προδιαγραφή DMR1 v1
| Θέση bytes | Μέγεθος | Περιγραφή |
| --- | --- | --- |
| 0–3 | 4 bytes | ASCII magic `DMR1` (hex `44 4d 52 31`) |
| 4–5 | 2 bytes | Πλήθος samples, unsigned little-endian |
| Από 6 | ακριβώς count bytes | Κάθε byte είναι μία τιμή 0–255 |

Το εκπαιδευτικό όριο είναι **64 samples**, για να μάθεις έλεγχο μεγεθών. Επιτρέπεται κενό payload αλλά **όχι** επιπλέον bytes. Δεν υπάρχει checksum, text encoding, συμπίεση, δικτυακό πρωτόκολλο ή διαπραγμάτευση έκδοσης.

## Πλήρες εργαστήριο χωρίς εξαρτήσεις
Δημιούργησε αρχείο `dmr1_lab.py` σε Linux, Windows ή Termux με τον παρακάτω κώδικα. Τρέξε `python3 dmr1_lab.py` ή `python dmr1_lab.py` ανάλογα με την εγκατάσταση Python 3:
~~~python
import struct

MAGIC = b"DMR1"
MAX_SAMPLES = 64

def encode(values):
    if len(values) > MAX_SAMPLES or any(
        type(n) is not int or not 0 <= n <= 255 for n in values
    ):
        raise ValueError("invalid samples")
    return MAGIC + struct.pack("<H", len(values)) + bytes(values)

def decode(raw):
    if len(raw) < 6 or raw[:4] != MAGIC:
        raise ValueError("bad DMR1 header")
    count = struct.unpack_from("<H", raw, 4)[0]
    if count > MAX_SAMPLES or len(raw) != 6 + count:
        raise ValueError("bad DMR1 size")
    return list(raw[6:])

sample = encode([1, 2, 255])
print(sample.hex(), decode(sample))
assert sample.hex() == "444d523103000102ff"
assert decode(encode([])) == []
assert decode(encode([5] * 64)) == [5] * 64

malformed = [
    b"", b"DMR1", b"XXXX" + sample[4:],
    sample[:-1], sample + b"\x00",
    sample[:4] + b"\xff\xff" + sample[6:],
]
for raw in malformed:
    try:
        decode(raw)
    except ValueError:
        pass
    else:
        raise AssertionError("accepted malformed input")
print("malformed cases rejected:", len(malformed))
~~~
**Αναμενόμενη έξοδος:**
~~~text
444d523103000102ff [1, 2, 255]
malformed cases rejected: 6
~~~
Τα τέσσερα αρχικά bytes είναι η υπογραφή. Τα `03 00` δηλώνουν τρεις τιμές με little-endian διάταξη. Τα `01 02 ff` αποτελούν το payload. Ο parser ελέγχει το συνολικό μέγεθος **πριν** διαβάσει samples.

## Βρες τη δομή χωρίς να διαβάσεις τον parser
1. Παρήγαγε δύο fixtures, π.χ. `encode([7])` και `encode([7, 8])`. Σύγκρινε κοινό πρόθεμα, διαφορετικές θέσεις και μήκη.
2. Κατέγραψε υπόθεση για κάθε πεδίο: offset, width, endianness και επιτρεπόμενα όρια. Προέβλεψε τι δίνει το `encode([])`.
3. Επαλήθευσε κάθε πρόβλεψη στα bytes. Έπειτα διάβασε το `decode` και ξεχώρισε τεκμηριωμένη παρατήρηση από εικασία.
4. Άλλαξε ένα byte τη φορά **σε αντίγραφο**. Ξεχώρισε λάθος magic, κομμένο header, count μεγαλύτερο του payload και περιττά bytes.
5. Κράτησε πίνακα: μετάλλαξη, πρόβλεψη, πραγματικό exception και εναλλακτική εξήγηση.
6. Υπολόγισε `hashlib.sha256(raw).hexdigest()` για ακριβή σύγκριση αρχείων. Το hash δείχνει ότι άλλαξαν, όχι τι σημαίνουν τα bytes.

## Κριτήριο επιτυχίας
Εξήγησε γιατί το δείγμα `444d523103000102ff` έχει εννέα bytes, γιατί το count είναι τρία, γιατί απορρίπτονται και οι έξι κακές περιπτώσεις και γιατί 64 samples είναι έγκυρα ενώ 65 απορρίπτονται σκόπιμα. Δεν πρόκειται για parser παραγωγής· εκεί χρειάζονται ρητές εκδόσεις, όρια πόρων και fuzz testing. Μην εκτελείς άγνωστα binaries στο προσωπικό σου κινητό.

## Προαιρετική χρήση AI
Ζήτησε counterexamples και επαλήθευσέ τα ο ίδιος. Αποδείξεις είναι ο κώδικας, τα bytes και τα tests, όχι οι υποθέσεις του AI.
