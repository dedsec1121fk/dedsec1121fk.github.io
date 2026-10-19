# Πλαισίωση δυαδικών εγγραφών και αποκομμένη είσοδος

## Μηχανισμός και συμβόλαιο

Η ροή bytes δεν έχει εγγενείς εγγραφές εφαρμογής. Ένα πρόθεμα μήκους ορίζει το payload, αλλά ο parser πρέπει να το επικυρώνει πριν δεσμεύσει μνήμη ή διαβάσει σώμα. Όρισε πλάτος προθέματος, σειρά bytes, μέγιστο μήκος και συμπεριφορά τέλους. Τέσσερα unsigned bytes μπορούν να περιγράψουν σώμα πολύ μεγαλύτερο από τη μνήμη μικρής συσκευής.

Διαχώρισε «χρειάζονται bytes», «άκυρο πλαίσιο» και «κανονικό τέλος». Μερική τελική κεφαλίδα σημαίνει αποκοπή, όχι επιτυχή κενή εγγραφή. Μερικό payload δεν πρέπει να προωθεί τον δημόσιο cursor σαν να ολοκληρώθηκε η επεξεργασία. Το δείγμα χρησιμοποιεί μικρό μέγιστο ώστε η απόρριψη μεγέθους να ελέγχεται χωρίς μεγάλη δέσμευση.

## Τοπικό παράδειγμα

```python
import struct

def parse_one(raw, limit=16):
    if len(raw) < 4:
        raise ValueError("truncated header")
    size = struct.unpack("!I", raw[:4])[0]
    if size > limit:
        raise ValueError("oversized frame")
    if len(raw) != 4 + size:
        raise ValueError("truncated body or trailing bytes")
    return raw[4:]
assert parse_one(struct.pack("!I", 3) + b"abc") == b"abc"
for bad in (b"\x00", struct.pack("!I", 17), struct.pack("!I", 3)+b"ab"):
    try:
        parse_one(bad)
    except ValueError:
        continue
    raise AssertionError("bad frame accepted")
print("frame limits enforced")
```

## Έλεγχοι αποτυχίας και όρια

Η συνάρτηση αναλύει ακριβώς ένα πλήρες πλαίσιο. Το πρωτόκολλο ροής χρειάζεται buffer και σταδιακές καταστάσεις αντί να θεωρεί κάθε σύντομη ανάγνωση τελική αποτυχία. Δοκίμασε κενό payload, πολλαπλά πλαίσια, κάθε θέση διαχωρισμού και άκυρα μεγέθη. Πρόσθεσε ξεχωριστά όρια αποσυμπίεσης όταν μικρό έγκυρο πλαίσιο περιέχει περιεχόμενο με μεγάλη επέκταση.

## Πρωτογενής αναφορά

[Επίσημη τεκμηρίωση](https://docs.python.org/3/library/struct.html)
