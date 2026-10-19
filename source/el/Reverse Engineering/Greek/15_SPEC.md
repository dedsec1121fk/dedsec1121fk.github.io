# Σύνταξη μικρής προδιαγραφής μορφής από ελεγχόμενες παρατηρήσεις

## Μοντέλο και όρια συμπερασμάτων
Η αντίστροφη μηχανική αποκτά πραγματική αξία όταν οι παρατηρήσεις γίνονται σαφής, ελέγξιμη προδιαγραφή. Μια χρήσιμη προδιαγραφή ορίζει offsets, μήκη, encodings, περιορισμούς, συμπεριφορά σφαλμάτων και παραδείγματα. Άγνωστα πεδία πρέπει να σημειώνονται ως άγνωστα και όχι να αποκτούν φαντασμένη σημασία. Κάθε ισχυρισμός χρειάζεται έγκυρο και άκυρο fixture.

## Αυτοτελές δοκιμαστικό δείγμα
~~~python
from dataclasses import dataclass
import struct
@dataclass(frozen=True)
class Header:
    version: int
    count: int

def parse(data: bytes) -> Header:
    if len(data) != 7 or data[:4] != b"SPEC":
        raise ValueError("bad envelope")
    version, count = struct.unpack_from("<BH", data, 4)
    if version != 1 or count > 100:
        raise ValueError("unsupported header")
    return Header(version, count)

assert parse(b"SPEC" + struct.pack("<BH", 1, 4)) == Header(1, 4)
for invalid in (b"SP", b"SPEC" + struct.pack("<BH", 2, 4)):
    try: parse(invalid)
    except ValueError: pass
    else: raise AssertionError("bad header accepted")
~~~

## Βήματα έρευνας και ελέγχου
Γράψε πίνακα πεδίων: bytes 0–3 magic SPEC, 4 version u8, 5–6 count u16 little-endian. Όρισε αποτυχίες για λάθος magic, μήκος, μη υποστηριζόμενο version και count πάνω από 100. Απόφασισε αν επιτρέπονται trailing bytes. Υλοποίησε parser ανεξάρτητα από τη δημιουργία fixtures ώστε να αποφύγεις κυκλική επιβεβαίωση.

## Πρακτικό εργαστήριο
Πρόσθεσε version 2 με ένα νέο flag byte. Σχεδίασε backward-compatibility tests και όρισε ποιοι readers δέχονται ή απορρίπτουν τη νέα μορφή. Βάλε ένα μικρό hex fixture και σχολιασμό ανά πεδίο στην τεκμηρίωση.

## Μετέτρεψε την παρατήρηση σε ελέγξιμο specification
Φτιάξε πίνακα πεδίων με offset, μέγεθος, encoding, επιτρεπτές τιμές και συμπεριφορά σε σφάλμα για κάθε έκδοση του δικού σου format. Κράτησε δύο έγκυρα fixtures και τρία άκυρα: κομμένο header, άγνωστη έκδοση και μήκος payload μεγαλύτερο από τα εναπομείναντα bytes. Πρέπει να ορίσεις αν άγνωστα flags αγνοούνται, διατηρούνται ή απορρίπτονται — όχι να επινοείς κανόνες από ένα μοναδικό δείγμα. Για έγκυρες τιμές έλεγξε `decode(encode(value)) == value` και για κάθε κανόνα απόρριψης κράτησε συγκεκριμένο ελαττωματικό fixture. Όσα πεδία είναι μόνο υποθέσεις να σημειώνονται ως προσωρινά.
